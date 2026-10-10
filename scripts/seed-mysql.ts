import 'dotenv/config';
import { createDatabase } from '../server/database';
import { seedContent } from '../server/seed-content';
const db=createDatabase();
try{
  const apply=process.argv.includes('--apply');
  console.log(apply?'Inserted missing public defaults:':'Preview of missing public defaults (no changes):',await seedContent(db,apply));
}finally{await db.end();}
