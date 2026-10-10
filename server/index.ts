import 'dotenv/config';
import { createDatabase } from './database';
import { createApp } from './app';
import { mediaRoot, verifyMediaWritable } from './media';

if (process.env.INQUIRY_DATABASE !== 'mysql') throw new Error('Set INQUIRY_DATABASE=mysql for the MySQL server.');
const db=createDatabase();
await db.execute('SELECT 1');
const storage=await mediaRoot(process.env.MEDIA_ROOT);
await verifyMediaWritable(storage);
const app=createApp(db,{mediaRoot:storage,origin:process.env.SITE_URL || 'https://lalusispartnerslaw.com'});
const server=app.listen(Number(process.env.PORT || 3000),'0.0.0.0',()=>console.log('Website backend listening.'));
for(const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>{server.close(()=>{db.end().finally(()=>process.exit(0));});});
