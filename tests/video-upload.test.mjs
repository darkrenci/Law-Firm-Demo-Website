import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
let uploaded, metadata, optimized=0, removed=0, failInsert=false;
const storage = {
 upload: async (path,file,options) => { uploaded={file,options}; return {data:{path},error:null}; },
 getPublicUrl: path => ({data:{publicUrl:'https://example.test/'+path}}),
 remove: async () => {removed++;return {error:null};},
};
const context=vm.createContext({console,Date,Math,crypto,STORAGE_BUCKET:'media',isSupabaseConfigured:true,
 optimizePhotoUpload:async file=>{optimized++;return file;},
 supabase:{storage:{from:()=>storage},from:()=>({select:()=>({limit:async()=>({error:null})}),insert:async data=>{metadata=data;return {error:failInsert?{message:'denied'}:null};}})},
});
const source=readFileSync(new URL('../src/services/supabaseService.ts',import.meta.url),'utf8');
vm.runInContext(stripTypeScriptTypes(source.replace(/import[\s\S]*?from ['"][^'"]+['"];\s*/g,'').replaceAll('export ','').replace('import.meta','({})').replace('const supabaseService =','globalThis.service =')),context);
for(const type of ['video/mp4','video/webm']) {
 const file=new File(['video bytes'],'clip.'+type.split('/')[1],{type});
 const result=await context.service.uploadMediaFile(file);
 assert.equal(uploaded.file,file,'video binary is not converted into an image');
 assert.equal(uploaded.options.contentType,type);
 assert.equal(metadata.file_type,'video');
 assert.equal(result.mediaItem.fileType,'video');
}
assert.equal(optimized,0);
await assert.rejects(context.service.uploadMediaFile(new File(['bad'],'bad.exe',{type:'application/octet-stream'})),/Invalid file type/);
await assert.rejects(context.service.uploadMediaFile({type:'video/mp4',size:26*1024*1024}),/too large/);
await context.service.uploadMediaFile(new File(['image'],'photo.jpg',{type:'image/jpeg'}));
assert.equal(optimized,1,'image optimization is preserved');
failInsert=true;
await assert.rejects(context.service.uploadMediaFile(new File(['video'],'clip.mp4',{type:'video/mp4'})),/Failed to record media/);
assert.equal(removed,1,'failed metadata writes clean up uploaded storage objects');
console.log('PASS: MP4/WebM binary upload, persisted video type, size/type rejection, image optimization and failed-upload cleanup');
