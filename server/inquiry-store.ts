import { createDatabase } from './database';
let db: ReturnType<typeof createDatabase> | undefined;
export async function closeInquiryDatabase() { await db?.end(); db=undefined; }
export async function saveMysqlInquiry(table: string, record: Record<string, string | boolean | null>) {
  if(!['consultation_requests','contact_messages'].includes(table))throw new Error('Invalid inquiry table');
  db ||= createDatabase();
  const columns=Object.keys(record);
  if(columns.some(c=>! /^[a-z_]+$/.test(c)))throw new Error('Invalid column');
  try {
    await db.execute('INSERT INTO `'+table+'` ('+columns.map(c=>'`'+c+'`').join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')',Object.values(record));
  } catch(error:any) {
    if(error.code!=='ER_DUP_ENTRY')throw error;
    const [rows]:any=await db.execute('SELECT id FROM `'+table+'` WHERE id=?',[record.id]);
    if(!rows.length)throw error;
  }
}
