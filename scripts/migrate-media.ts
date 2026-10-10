import 'dotenv/config';
import { createDatabase } from '../server/database';
import { migrateMedia } from '../server/media-migration';
const {MEDIA_BACKUP_DIR,MEDIA_ROOT,LEGACY_SUPABASE_URL}=process.env;
if(!MEDIA_BACKUP_DIR||!MEDIA_ROOT||!LEGACY_SUPABASE_URL)throw new Error('Set MEDIA_BACKUP_DIR, MEDIA_ROOT and LEGACY_SUPABASE_URL in your private environment.');
const db=createDatabase();
try{
  console.log(await migrateMedia(db,{backup:MEDIA_BACKUP_DIR,destination:MEDIA_ROOT,legacyOrigin:LEGACY_SUPABASE_URL,apply:process.argv.includes('--apply')}));
}finally{await db.end();}
