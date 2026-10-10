import type { Pool } from 'mysql2/promise';

// Explicit identifiers only; neither table names nor SQL fragments come from clients.
const fields: Record<string,string> = {
  pages: 'slug title is_published meta_title meta_description sections order_index',
  attorneys: 'slug full_name professional_title portrait_url primary_specialization biography email direct_phone linkedin_url is_partner is_featured is_published order_index practice_area_ids education bar_admissions professional_experience memberships awards selected_publications home_card_image_url home_modal_image_url partner_page_image_url',
  practice_areas: 'slug title icon_name short_description full_description key_capabilities key_stat is_published order_index',
  articles: 'slug title excerpt content reading_time category published_at author status featured_image practice_area_id',
  news: 'slug title excerpt content date category status featured_image practice_area_id',
  site_settings: 'settings',
  navigation: 'label path is_visible order_index children',
  faqs: 'category_id question answer order_index is_published',
  faq_categories: 'name slug description order_index',
  consultation_requests: 'reference_number full_name email_address contact_number company_name preferred_consultation_type practice_area_id preferred_date preferred_time brief_concern privacy_consent status internal_notes',
  contact_messages: 'full_name email phone subject message status notes',
};
const json = new Set('sections settings children author key_capabilities practice_area_ids education bar_admissions professional_experience memberships awards selected_publications'.split(' '));
export function invalid(message='Invalid content.') { return Object.assign(new Error(message),{status:400}); }
function record(table:string, value:any) {
  if(!Object.hasOwn(fields,table)) throw invalid('This table cannot be edited.');
  if(!value || Array.isArray(value) || typeof value!=='object' || typeof value.id!=='string' || !value.id.length || value.id.length>191) throw invalid();
  const allowed=new Set(('id created_at updated_at '+fields[table]).split(' '));
  return Object.entries(value).map(([key,v]):[string,any]=>{
    if(!allowed.has(key))throw invalid('Unknown field.');
    if(json.has(key))return [key,JSON.stringify(v)];
    if(key.endsWith('_at') && v!==null){
      if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))throw invalid('Invalid date.');
      return [key,new Date(v).toISOString().slice(0,23).replace('T',' ')];
    }
    if(v!==null&&!['string','number','boolean'].includes(typeof v))throw invalid();
    if((key.startsWith('is_')||key==='privacy_consent')&&typeof v!=='boolean')throw invalid('Invalid visibility.');
    return [key,v];
  });
}
export async function writeContent(db:Pool,table:string,body:any) {
  const {operation,rows,id}=body||{};
  if(!Object.hasOwn(fields,table))throw invalid('This table cannot be edited.');
  if(operation==='delete'){
    if(typeof id!=='string'||!id.length||id.length>191)throw invalid();
    const [result]:any=await db.execute('DELETE FROM `'+table+'` WHERE id=?',[id]);
    return result.affectedRows?[{id}]:[];
  }
  if(!['upsert','insert','replace'].includes(operation)||operation==='replace'&&table!=='navigation')throw invalid();
  if(!Array.isArray(rows)||rows.length>200||(!rows.length&&operation!=='replace'))throw invalid();
  const prepared=rows.map(r=>record(table,r));
  if(new Set(rows.map(r=>r.id)).size!==rows.length)throw invalid('Duplicate record ID.');
  const connection=await db.getConnection();
  try {
    await connection.beginTransaction();
    if(operation==='replace')await connection.query('DELETE FROM navigation');
    for(const entries of prepared){
      const id=entries.find(([k])=>k==='id')![1];
      // Update by primary key only. A conflicting unique slug must never overwrite another row.
      const [existing]:any=await connection.execute('SELECT id FROM `'+table+'` WHERE id=? FOR UPDATE',[id]);
      if(operation==='upsert'&&existing.length){
        const changes=entries.filter(([k])=>k!=='id'&&k!=='created_at');
        if(changes.length)await connection.execute('UPDATE `'+table+'` SET '+changes.map(([k])=>'`'+k+'`=?').join(',')+' WHERE id=?',[...changes.map(([,v])=>v),id]);
      }else{
        await connection.execute('INSERT INTO `'+table+'` ('+entries.map(([k])=>'`'+k+'`').join(',')+') VALUES ('+entries.map(()=>'?').join(',')+')',entries.map(([,v])=>v));
      }
    }
    await connection.commit();return rows.map(r=>({id:r.id}));
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}

// Settings contain public presentation data only; future private keys stay server-side.
export function publicSettings(settings:any) {
  const groups:Record<string,string>={general:'firmName tagline headline subheadline logoUrl secondaryLogoUrl faviconUrl establishedYear',contact:'address suiteFloor cityStateZip country telephone emergencyLine fax email consultationEmail officeHoursWeekday officeHoursWeekend googleMapEmbedUrl',social:'linkedin facebook twitter barDirectory',branding:'primaryAccent secondaryAccent backgroundColor cardBackgroundColor headingFont bodyFont',seo:'defaultTitle defaultDescription socialPreviewImage indexSite',seoDefaults:'metaTitle metaDescription'};
  const result:any={};
  for(const [group,keys] of Object.entries(groups))if(settings?.[group])result[group]=Object.fromEntries(keys.split(' ').filter(k=>['string','number','boolean'].includes(typeof settings[group][k])).map(k=>[k,settings[group][k]]));
  for(const key of ['firmName','firmTagline','foundedYear','jurisdiction'])if(['string','number'].includes(typeof settings?.[key]))result[key]=settings[key];
  return result;
}
