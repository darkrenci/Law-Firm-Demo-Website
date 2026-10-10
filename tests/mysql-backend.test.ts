import { mysqlAuth, mysqlClient } from '../src/lib/mysqlClient';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { createDatabase, migrateBackend } from '../server/database';
import { createApp } from '../server/app';
import { hashPassword } from '../server/auth';
import { closeInquiryDatabase } from '../server/inquiry-store';

// Must point to a dedicated EMPTY test database. Never use the production database.
test('MySQL backend: auth boundaries, filtering, inquiries, and clean URLs', async () => {
  assert.equal(process.env.DB_NAME,'lalusis_backend_test','Tests require a dedicated test database');
  const db=createDatabase();
  const [existing]:any=await db.query('SHOW TABLES');assert.equal(existing.length,0,'Test database must be empty');
  await migrateBackend(db);
  await db.query('CREATE TABLE pages (id VARCHAR(191) PRIMARY KEY, title TEXT, is_published BOOLEAN, sections JSON)');
  await db.query("INSERT INTO pages VALUES ('published','Public',1,'[]'),('draft','Private',0,'[]')");
  await db.query('CREATE TABLE navigation (id VARCHAR(191) PRIMARY KEY,label VARCHAR(100) UNIQUE,path TEXT,is_visible BOOLEAN,order_index INT,children JSON)');
  await db.query('CREATE TABLE site_settings (id VARCHAR(191) PRIMARY KEY,settings JSON)');
  await db.execute('INSERT INTO site_settings VALUES (?,?)',['firm_settings',JSON.stringify({general:{firmName:'Test Firm',secret:'private'},smtpPassword:'private'})]);
  await db.query('CREATE TABLE contact_messages (id VARCHAR(191) PRIMARY KEY, full_name TEXT,email TEXT,phone TEXT,subject TEXT,message LONGTEXT,status TEXT)');
  await db.query('CREATE TABLE consultation_requests (id VARCHAR(191) PRIMARY KEY,reference_number VARCHAR(191) UNIQUE,full_name TEXT,email_address TEXT,contact_number TEXT,company_name TEXT,preferred_consultation_type TEXT,preferred_date TEXT,preferred_time TEXT,brief_concern LONGTEXT,privacy_consent BOOLEAN,status TEXT)');
  await db.execute('INSERT INTO app_admins (id,email,password_hash) VALUES (?,?,?)',[randomUUID(),'admin@example.test',hashPassword('test-only-long-password')]);
  const dist=mkdtempSync(path.join(tmpdir(),'lalusis-backend-'));
  for(const [file,body] of Object.entries({'index.html':'Home','about.html':'About','practice-areas.html':'Practice','admin.html':'Login','404.html':'Missing'}))writeFileSync(path.join(dist,file),body);
  const origin='http://localhost:31999';
  const server=createApp(db,{origin,dist,secureCookies:false}).listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+(server.address() as any).port;
  const post=(url:string,body:any,headers:any={})=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify(body)});
  const oldTransport=nodemailer.createTransport; const mail:any[]=[];
  (nodemailer as any).createTransport=(config:any)=>({sendMail:async(data:any)=>{mail.push({config,data});return {accepted:['inquiries@example.test'],rejected:[]};},close(){}});
  Object.assign(process.env,{INQUIRY_DATABASE:'mysql',SMTP_HOST:'smtp.hostinger.com',SMTP_PORT:'465',SMTP_USER:'inquiries@example.test',SMTP_PASSWORD:' password with spaces ',INQUIRY_EMAIL_TO:'inquiries@example.test'});
  try {
    assert.equal((await fetch(base+'/api/admin/contact_messages')).status,401);
    assert.equal((await fetch(base+'/api/content/contact_messages')).status,404);
    assert.equal((await fetch(base+'/api/content/app_admins')).status,404);
    const publicRows=await (await fetch(base+'/api/content/pages')).json();assert.equal(publicRows.data.length,1);assert.equal(publicRows.data[0].id,'published');
    assert.equal((await post('/api/auth/login',{email:'admin@example.test',password:'test-only-long-password'},{Origin:'https://evil.test'})).status,403);
    assert.equal((await post('/api/auth/login',{email:'admin@example.test',password:'wrong'})).status,401);
    const login=await post('/api/auth/login',{email:'admin@example.test',password:'test-only-long-password'});assert.equal(login.status,200);
    const setCookie=login.headers.get('set-cookie')!;assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/SameSite=Strict/i);
    const cookie=setCookie.split(';')[0];const headers={Cookie:cookie};
    assert.equal((await fetch(base+'/api/auth/me',{headers})).status,200);
    const adminRows=await (await fetch(base+'/api/admin/pages',{headers})).json();assert.equal(adminRows.data.length,2);
    assert.equal((await post('/api/admin/pages',{operation:'upsert',rows:[{id:'new',title:'New',sections:[],is_published:true}]})).status,401);
    assert.equal((await post('/api/admin/pages',{operation:'upsert',rows:[{id:'new',title:'New',sections:[],is_published:true}]},headers)).status,200);
    assert.equal((await post('/api/admin/pages',{operation:'upsert',rows:[{id:'new',title:'Edited'}]},headers)).status,200);
    const [edited]:any=await db.query("SELECT title FROM pages WHERE id='new'");assert.equal(edited[0].title,'Edited');
    assert.equal((await post('/api/admin/pages',{operation:'delete'},headers)).status,400);
    assert.equal((await post('/api/admin/pages',{operation:'upsert',rows:[{id:'new',password_hash:'injected'}]},headers)).status,400);
    assert.equal((await post('/api/admin/app_admins',{operation:'delete',id:'anything'},headers)).status,404);
    assert.equal((await post('/api/admin/pages',{operation:'delete',id:'new'},{...headers,Origin:'https://evil.test'})).status,403);
    assert.equal((await post('/api/admin/pages',{operation:'delete',id:'new'},headers)).status,200);
    const navigation=[{id:'nav1',label:'Home',path:'/',is_visible:true,order_index:1,children:[]}];
    assert.equal((await post('/api/admin/navigation',{operation:'replace',rows:navigation},headers)).status,200);
    assert.equal((await post('/api/admin/navigation',{operation:'replace',rows:[...navigation,{...navigation[0],id:'nav2'}]},headers)).status,409);
    const [preserved]:any=await db.query('SELECT id FROM navigation');assert.deepEqual(preserved,[{id:'nav1'}]);
    const settings=await (await fetch(base+'/api/content/site_settings')).json();assert.deepEqual(settings.data[0].settings,{general:{firmName:'Test Firm'}});
    const originalFetch=globalThis.fetch;
    globalThis.fetch=((url:any,options:any={})=>originalFetch(typeof url==='string'&&url.startsWith('/')?base+url:url,{...options,headers:{...options.headers,Origin:origin,Cookie:cookie}})) as typeof fetch;
    try {
      assert.ok((await mysqlAuth.getUser()).data.user);
      const clientRows=await mysqlClient.from('pages').select('*').eq('id','draft').maybeSingle();assert.equal(clientRows.data.title,'Private');
      const saved=await mysqlClient.from('pages').upsert({id:'adapter',title:'Bridge test',sections:[],is_published:false});assert.equal(saved.error,null);
      const removed=await mysqlClient.from('pages').delete().eq('id','adapter').select('id');assert.deepEqual(removed.data,[{id:'adapter'}]);
    }finally{globalThis.fetch=originalFetch;}
    const [sessions]:any=await db.query('SELECT token_hash FROM app_sessions');assert.notEqual(sessions[0].token_hash,cookie.split('=')[1]);
    assert.equal((await post('/api/auth/logout',{},headers)).status,200);
    assert.equal((await fetch(base+'/api/auth/me',{headers})).status,401);
    for(const url of ['/','/about','/practice-areas','/admin/login'])assert.equal((await fetch(base+url)).status,200);
    assert.equal((await fetch(base+'/unknown')).status,404);
    assert.equal((await fetch(base+'/.env')).status,404);
    assert.equal((await fetch(base+'/api/inquiry')).status,405);
    assert.equal((await post('/api/inquiry',{kind:'consultation'})).status,400);
    for(const kind of ['contact','consultation']){
      const body={requestId:randomUUID(),kind,fullName:'Test client',email:'client@example.test',message:'Test inquiry',consent:true};
      assert.equal((await post('/api/inquiry',body)).status,200);
      assert.equal((await post('/api/inquiry',body)).status,200);
    }
    for(const table of ['contact_messages','consultation_requests']){const [rows]:any=await db.query('SELECT COUNT(*) AS n FROM '+table);assert.equal(rows[0].n,1);}
    assert.equal(mail.length,4);assert.equal(mail[0].data.replyTo,'client@example.test');assert.equal(mail[0].data.from.address,'inquiries@example.test');
    assert.equal(mail[0].config.auth.pass,' password with spaces ');assert.equal(mail[0].config.secure,true);
    assert.equal((await post('/api/inquiry',{})).status,429);
  } finally {
    nodemailer.createTransport=oldTransport;
    await new Promise<void>(resolve=>server.close(()=>resolve()));
    await closeInquiryDatabase();await db.end();rmSync(dist,{recursive:true,force:true});
  }
});
