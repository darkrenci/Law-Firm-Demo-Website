import type { Pool } from 'mysql2/promise';
import { publicSettings } from './content';

export const publicTables: Record<string, string> = {
  pages: 'is_published = 1', attorneys: 'is_published = 1', practice_areas: 'is_published = 1',
  articles: "status = 'published'", news: "status = 'published'", faqs: 'is_published = 1',
  faq_categories: '1=1', navigation: 'is_visible = 1', site_settings: "id = 'firm_settings'",
};
const jsonColumns = new Set('sections settings children author snapshot key_capabilities practice_area_ids education bar_admissions professional_experience memberships awards selected_publications'.split(' '));
export function normalize(rows:any[]) {
  return rows.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,
    jsonColumns.has(key)&&typeof value==='string'?JSON.parse(value):key.startsWith('is_')||key==='privacy_consent'?Boolean(value):value])));
}
export function sanitizePublicRows(table:string,rows:any[]) {
  return normalize(rows).map(row=>table==='site_settings'?{id:row.id,settings:publicSettings(row.settings)}:row);
}
export async function publicSnapshot(db:Pool) {
  const connection=await db.getConnection();
  try{
    await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.query('START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY');
    const snapshot:Record<string,any[]>={};
    for(const [table,filter] of Object.entries(publicTables)){
      const [rows]:any=await connection.query('SELECT * FROM `'+table+'` WHERE '+filter);
      snapshot[table]=sanitizePublicRows(table,rows);
    }
    if(!snapshot.site_settings.length)throw new Error('Missing firm_settings. Run the reviewed content seed before building.');
    await connection.commit();return snapshot;
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
