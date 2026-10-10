import path from 'node:path';
import { constants } from 'node:fs';
import { copyFile, mkdir, open, readFile, realpath, stat } from 'node:fs/promises';
import type { Pool } from 'mysql2/promise';
import { normalize } from './public-content';
import { fileKind, inside, mediaFile, mediaRoot, sha256 } from './media';

const tables=['media','pages','page_versions','site_settings','attorneys','practice_areas','articles','news','faqs','faq_categories','navigation'];
type Asset={source:string;path:string;hash:string;bytes:number;ext:string;type:string;target:string;id:string};
export async function migrateMedia(db:Pool,options:{backup:string;destination:string;legacyOrigin:string;apply?:boolean}){
  const origin=new URL(options.legacyOrigin).origin;
  if(!origin.startsWith('https://')||!new URL(origin).hostname.endsWith('.supabase.co'))throw new Error('Set LEGACY_SUPABASE_URL to the original Supabase project URL.');
  const backup=await realpath(options.backup),storage=await realpath(path.join(backup,'storage','media'));
  if(!inside(backup,storage))throw new Error('Backup media directory escapes the backup root.');
  const manifest=JSON.parse((await readFile(path.join(backup,'storage-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
  if(!Array.isArray(manifest)||!manifest.length)throw new Error('No media files in backup manifest.');
  const assets=new Map<string,Asset>();
  for(const entry of manifest){
    if(typeof entry.Path!=='string'||!entry.Path.startsWith('/media/')||!Number.isSafeInteger(entry.Bytes)||!/^[a-f0-9]{64}$/i.test(entry.SHA256))throw new Error('Invalid backup manifest.');
    const relative=entry.Path.slice('/media/'.length);
    if(assets.has(relative))throw new Error('Duplicate backup path.');
    const source=await mediaFile(storage,relative),size=(await stat(source)).size,hash=await sha256(source);
    if(size!==entry.Bytes||hash!==entry.SHA256.toLowerCase())throw new Error('Media backup hash or size mismatch. No database changes applied.');
    const handle=await open(source,'r'),header=Buffer.alloc(512);let kind;
    try{const {bytesRead}=await handle.read(header,0,512,0);kind=fileKind(header.subarray(0,bytesRead));}finally{await handle.close();}
    assets.set(relative,{source,path:relative,hash,bytes:size,ext:kind.ext,type:kind.type,target:'imports/'+hash+'.'+kind.ext,id:'migrated-'+hash.slice(0,32)});
  }
  let copied=0;
  if(options.apply){
    const destination=await mediaRoot(options.destination);
    await mkdir(path.join(destination,'imports'),{recursive:true});
    const imports=await realpath(path.join(destination,'imports'));if(!inside(destination,imports))throw new Error('Invalid import directory.');
    for(const asset of assets.values()){
      const file=path.join(destination,asset.target);
      try{await copyFile(asset.source,file,constants.COPYFILE_EXCL);copied++;}catch(error:any){if(error.code!=='EEXIST')throw error;}
      if(await sha256(await mediaFile(destination,asset.target))!==asset.hash)throw new Error('Destination hash mismatch. No database changes applied.');
    }
  }
  const connection=await db.getConnection();let changed=0,inserted=0;
  try{
    await connection.beginTransaction();
    const data:Record<string,any[]>={};
    for(const table of tables){const [rows]:any=await connection.query('SELECT * FROM `'+table+'`'+(options.apply?' FOR UPDATE':''));data[table]=normalize(rows);}
    // Reuse existing IDs so media references stay stable. Hash IDs make repeat runs safe.
    for(const asset of assets.values()){
      const existing=data.media.find(row=>row.storage_path===asset.path||row.storage_path===asset.target||row.id===asset.id);
      if(existing)asset.id=existing.id;
    }
    const prefixes=[origin+'/storage/v1/object/public/media/',origin+'/storage/v1/render/image/public/media/'];
    function rewrite(value:any):any{
      if(typeof value==='string')return value.replace(/https?:\/\/[^\s<>"'\\]+/g,url=>{
        const prefix=prefixes.find(p=>url.startsWith(p));if(!prefix)return url;
        const relative=decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);const asset=assets.get(relative);
        if(!asset)throw new Error('A referenced Supabase file is missing from the verified backup. No database changes applied.');
        return '/media/'+encodeURIComponent(asset.id);
      });
      if(Array.isArray(value))return value.map(rewrite);
      if(value&&typeof value==='object'&&!Buffer.isBuffer(value))return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewrite(v)]));
      return value;
    }
    for(const [table,rows] of Object.entries(data))for(const row of rows){
      const updates:Record<string,any>={};
      for(const [key,value] of Object.entries(row)){
        if(key==='id')continue;const next=rewrite(value);
        if(JSON.stringify(next)!==JSON.stringify(value))updates[key]=next;
      }
      if(table==='media'){
        const asset=[...assets.values()].find(a=>a.path===row.storage_path||a.target===row.storage_path||a.id===row.id);
        if(asset){
          if(row.storage_path!==asset.target)updates.storage_path=asset.target;
          if(row.url!=='/media/'+encodeURIComponent(row.id))updates.url='/media/'+encodeURIComponent(row.id);
        }
      }
      const entries=Object.entries(updates);if(!entries.length)continue;changed++;
      if(entries.some(([k])=>!/^[a-z_]+$/.test(k)))throw new Error('Unexpected database column.');
      if(options.apply)await connection.execute('UPDATE `'+table+'` SET '+entries.map(([k])=>'`'+k+'`=?').join(',')+' WHERE id=?',[...entries.map(([,v])=>typeof v==='object'&&v!==null?JSON.stringify(v):v),row.id]);
    }
    const knownIds=new Set(data.media.map(row=>row.id));
    for(const asset of assets.values())if(!knownIds.has(asset.id)){
      knownIds.add(asset.id);
      inserted++;
      if(options.apply)await connection.execute('INSERT INTO media (id,name,filename,original_name,storage_path,url,file_type,format,size_bytes,size,category,alt_text) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [asset.id,path.basename(asset.path),path.basename(asset.path),path.basename(asset.path),asset.target,'/media/'+asset.id,asset.type,asset.ext.toUpperCase(),asset.bytes,Math.ceil(asset.bytes/1024)+' KB','general',path.basename(asset.path)]);
    }
    if(options.apply)await connection.commit();else await connection.rollback();
    return {verifiedFiles:assets.size,copiedFiles:copied,changedRows:changed,insertedMedia:inserted,applied:Boolean(options.apply)};
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
