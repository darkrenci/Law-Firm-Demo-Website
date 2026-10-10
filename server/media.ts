import path from 'node:path';
import { createReadStream } from 'node:fs';
import { mkdir, open, realpath, stat, unlink } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import type { Pool } from 'mysql2/promise';
import type { Request, Response } from 'express';

export const mediaError=(status:number,message:string)=>Object.assign(new Error(message),{status,expose:true});
export function inside(root:string,file:string){const relative=path.relative(root,file);return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);}
export async function mediaRoot(directory:string|undefined) {
  if(!directory||!path.isAbsolute(directory))throw mediaError(503,'Persistent media storage is not configured.');
  // Hostinger replaces these directories on deployment. Never store uploads there.
  if(directory.split(/[\\/]/).some(part=>['hbuilds','public_html','dist'].includes(part)))throw new Error('MEDIA_ROOT must be outside deployment-managed folders.');
  await mkdir(directory,{recursive:true});
  const root=await realpath(directory), app=await realpath(process.cwd());
  if(root===app||inside(app,root))throw new Error('MEDIA_ROOT must be outside the application directory.');
  return root;
}
export async function verifyMediaWritable(root:string) {
  const probe=path.join(root,'.write-test-'+randomUUID());
  let handle;
  try{
    handle=await open(probe,'wx',0o600);
    await handle.writeFile('ok');
    await handle.sync();
  }catch(error:any){
    throw new Error('MEDIA_ROOT is not writable by the Node.js process.',{cause:error});
  }finally{
    await handle?.close().catch(()=>{});
    await unlink(probe).catch(()=>{});
  }
}
export async function mediaFile(root:string,relative:string) {
  if(!relative||relative.includes('\\')||relative.split('/').some(part=>!part||part==='.'||part==='..')||path.isAbsolute(relative))throw mediaError(400,'Invalid media path.');
  const file=await realpath(path.join(root,relative));
  if(!inside(root,file))throw mediaError(400,'Invalid media path.');
  return file;
}
export async function sha256(file:string){const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');}
export function fileKind(header:Buffer) {
  if(header.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')))return {ext:'png',mime:'image/png',type:'image'};
  if(header[0]===255&&header[1]===216&&header[2]===255)return {ext:'jpg',mime:'image/jpeg',type:'image'};
  if(['GIF87a','GIF89a'].includes(header.toString('ascii',0,6)))return {ext:'gif',mime:'image/gif',type:'image'};
  if(header.toString('ascii',0,4)==='RIFF'&&header.toString('ascii',8,12)==='WEBP')return {ext:'webp',mime:'image/webp',type:'image'};
  if(header.toString('ascii',0,5)==='%PDF-')return {ext:'pdf',mime:'application/pdf',type:'document'};
  if(header.toString('ascii',4,8)==='ftyp'&&/^(isom|iso[2-9]|mp4[12]|avc1|M4V |dash)$/.test(header.toString('ascii',8,12)))return {ext:'mp4',mime:'video/mp4',type:'video'};
  if(header.subarray(0,4).equals(Buffer.from('1a45dfa3','hex'))&&header.includes(Buffer.from('webm')))return {ext:'webm',mime:'video/webm',type:'video'};
  throw mediaError(415,'Use JPG, PNG, WEBP, GIF, PDF, MP4 or WEBM. SVG uploads are not supported.');
}
const categories=new Set(['portrait','architectural','branding','general','attorneys','offices','insights','video']);
function text(value:unknown,max:number,fallback=''){if(value===undefined)return fallback;if(typeof value!=='string'||value.length>max)throw mediaError(400,'Invalid media details.');return value.trim();}
export async function uploadMedia(db:Pool,directory:string|undefined,req:Request,res:Response) {
  if(req.get('content-type')?.split(';')[0]!=='application/octet-stream')throw mediaError(415,'Expected a binary file upload.');
  const name=text(req.query.name,200,'Uploaded file')||'Uploaded file';
  const alt=text(req.query.alt,500,name),category=text(req.query.category,30,'general');
  if(!categories.has(category))throw mediaError(400,'Invalid media category.');
  const limit=100*1024*1024;
  if(Number(req.get('content-length'))>limit)throw mediaError(413,'File is too large.');
  const root=await mediaRoot(directory),id='med-'+randomUUID(),storagePath=id+'.asset',file=path.join(root,storagePath);
  const handle=await open(file,'wx',0o600);let committed=false,size=0,header=Buffer.alloc(0);
  try{
    for await(const chunk of req){
      const bytes=Buffer.from(chunk);size+=bytes.length;
      if(size>limit)throw mediaError(413,'File is too large.');
      if(header.length<512)header=Buffer.concat([header,bytes.subarray(0,512-header.length)]);
      await handle.writeFile(bytes);
    }
    if(!size)throw mediaError(400,'The file is empty.');
    const kind=fileKind(header);
    if(kind.type!=='video'&&size>25*1024*1024)throw mediaError(413,'Images and documents must be at most 25 MB.');
    await handle.sync();await handle.close();
    const now=new Date().toISOString(),url='/media/'+id;
    await db.execute('INSERT INTO media (id,name,filename,original_name,storage_path,url,file_type,format,size_bytes,size,category,alt_text,uploaded_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))',
      [id,name,id+'.'+kind.ext,text(req.query.filename,255,id+'.'+kind.ext),storagePath,url,kind.type,kind.ext.toUpperCase(),size,Math.ceil(size/1024)+' KB',category,alt,(req as any).admin.id]);
    committed=true;
    res.status(201).json({url,storagePath,mediaItem:{id,name,url,fileType:kind.type,format:kind.ext.toUpperCase(),sizeBytes:size,size:Math.ceil(size/1024)+' KB',category,altText:alt,createdAt:now,uploadedAt:now}});
  }finally{
    await handle.close().catch(()=>{});
    if(!committed)await unlink(file).catch(()=>{});
  }
}
export async function serveMedia(db:Pool,directory:string|undefined,req:Request,res:Response) {
  const [rows]:any=await db.execute('SELECT storage_path,format FROM media WHERE id=?',[req.params.id]);
  if(!rows[0]?.storage_path)throw mediaError(404,'Media not found.');
  const root=await mediaRoot(directory);
  let file:string;
  try{file=await mediaFile(root,rows[0].storage_path);}catch(error:any){if(error.code==='ENOENT')throw mediaError(404,'Media not found.');throw error;}
  const handle=await open(file,'r');const header=Buffer.alloc(512);let kind;
  try{const read=await handle.read(header,0,512,0);kind=fileKind(header.subarray(0,read.bytesRead));}catch{throw mediaError(415,'Unsupported stored media.');}finally{await handle.close();}
  res.setHeader('Content-Type',kind.mime);res.setHeader('Cache-Control','public, max-age=86400');
  res.setHeader('Content-Security-Policy',"default-src 'none'; sandbox");
  if(kind.type==='document')res.setHeader('Content-Disposition','attachment; filename="document.pdf"');
  // sendFile handles video Range requests without buffering the entire video.
  res.sendFile(file,{dotfiles:'deny'});
}
export async function updateMedia(db:Pool,req:Request,res:Response){
  const name=text(req.body?.name,200),alt=text(req.body?.altText,500,name),category=text(req.body?.category,30,'general');
  if(!name||!categories.has(category))throw mediaError(400,'Invalid media details.');
  const [result]:any=await db.execute('UPDATE media SET name=?,alt_text=?,category=?,updated_at=UTC_TIMESTAMP(6) WHERE id=?',[name,alt,category,req.params.id]);
  if(!result.affectedRows)throw mediaError(404,'Media not found.');res.json({ok:true});
}
export async function deleteMedia(db:Pool,directory:string|undefined,req:Request,res:Response){
  const root=await mediaRoot(directory);
  const [rows]:any=await db.execute('SELECT storage_path FROM media WHERE id=?',[req.params.id]);
  if(!rows[0])return res.json({ok:true});
  // Only delete files owned by this upload endpoint. Imported backup files may be shared.
  const relative=rows[0].storage_path;
  await db.execute('DELETE FROM media WHERE id=?',[req.params.id]);
  if(relative===req.params.id+'.asset'&&/^med-[a-f0-9-]{36}\.asset$/.test(relative)){
    try{await unlink(await mediaFile(root,relative));}catch(error:any){if(error.code!=='ENOENT')console.error('Media file cleanup requires attention.');}
  }
  res.json({ok:true});
}
