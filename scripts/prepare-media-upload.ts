import path from 'node:path';
import { constants } from 'node:fs';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { fileKind, mediaFile, sha256 } from '../server/media';

const backup=process.env.MEDIA_BACKUP_DIR;
const output=process.env.MEDIA_PACKAGE_DIR;
if(!backup||!path.isAbsolute(backup)||!output||!path.isAbsolute(output)){
  throw new Error('Set absolute MEDIA_BACKUP_DIR and MEDIA_PACKAGE_DIR paths.');
}
const manifest=JSON.parse((await readFile(path.join(backup,'storage-manifest.json'),'utf8')).replace(/^\uFEFF/,''));
if(!Array.isArray(manifest)||!manifest.length)throw new Error('The media backup manifest is empty.');
const imports=path.join(output,'imports');
await mkdir(imports,{recursive:true});
const prepared=new Map<string,{file:string;bytes:number;sha256:string}>();
for(const entry of manifest){
  if(typeof entry.Path!=='string'||!entry.Path.startsWith('/media/')||!Number.isSafeInteger(entry.Bytes)||!/^[a-f0-9]{64}$/i.test(entry.SHA256))throw new Error('Invalid media manifest entry.');
  const source=await mediaFile(path.join(backup,'storage','media'),entry.Path.slice('/media/'.length));
  const actualHash=await sha256(source),bytes=(await stat(source)).size;
  if(actualHash!==entry.SHA256.toLowerCase()||bytes!==entry.Bytes)throw new Error('Backup verification failed for '+entry.Path);
  const header=(await readFile(source)).subarray(0,512),kind=fileKind(header);
  const file=actualHash+'.'+kind.ext,target=path.join(imports,file);
  if(!prepared.has(file)){
    try{await copyFile(source,target,constants.COPYFILE_EXCL);}catch(error:any){
      if(error.code!=='EEXIST'||await sha256(target)!==actualHash)throw error;
    }
    prepared.set(file,{file:'imports/'+file,bytes,sha256:actualHash});
  }
}
await writeFile(path.join(output,'UPLOAD-MANIFEST.json'),JSON.stringify([...prepared.values()],null,2)+'\n');
console.log(`Prepared ${prepared.size} unique verified files from ${manifest.length} backup entries.`);
