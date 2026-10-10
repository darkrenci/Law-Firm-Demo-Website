import type { Pool } from 'mysql2/promise';
import { initialPages, initialPracticeAreas, initialNavigation, initialSettings } from '../src/services/seedData';
import { writeContent } from './content';

// Only fill missing public defaults. Never create sample users, inquiries, or replace imported content.
export async function seedContent(db:Pool,apply=false){
  const retired=new Set(['insights','news','faqs']);
  const candidates:Record<string,any[]>={
    site_settings:[{id:'firm_settings',settings:initialSettings}],
    pages:initialPages.filter(p=>!retired.has(p.slug)).map(p=>({id:p.id,slug:p.slug,title:p.title,is_published:p.isPublished,meta_title:p.seoTitle||p.seo?.metaTitle||null,meta_description:p.seoDescription||p.seo?.metaDescription||null,sections:p.sections})),
    practice_areas:initialPracticeAreas.map(p=>({id:p.id,slug:p.slug,title:p.title,icon_name:p.iconName,short_description:p.shortDescription,full_description:p.fullDescription,key_capabilities:p.keyServices||[],is_published:p.status==='published',order_index:p.order||0})),
    navigation:initialNavigation.filter(p=>!retired.has(p.path.slice(1))).map(p=>({id:p.id,label:p.label,path:p.path,is_visible:p.isVisible,order_index:p.order,children:p.children||[]})),
  };
  const report:Record<string,number>={};
  const normalized=(value:string)=>value==='home'?'':value==='partners'?'attorneys':value==='/partners'?'/attorneys':value;
  for(const [table,rows] of Object.entries(candidates)){
    const key=table==='navigation'?'path':table==='site_settings'?'id':'slug';
    const [existing]:any=await db.query('SELECT id,`'+key+'` FROM `'+table+'`');
    const missing=rows.filter(row=>!existing.some((saved:any)=>saved.id===row.id||normalized(saved[key])===normalized(row[key])));
    report[table]=missing.length;
    if(apply&&missing.length)await writeContent(db,table,{operation:'insert',rows:JSON.parse(JSON.stringify(missing))});
  }
  return report;
}
