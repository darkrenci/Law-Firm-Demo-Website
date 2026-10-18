import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import type { Pool } from 'mysql2/promise';
import { cookieToken, hashPassword, newToken, tokenHash, verifyPassword } from './auth';
import { writeContent } from './content';
import { publicTables, normalize, sanitizePublicRows } from './public-content';
import { uploadMedia, serveMedia, updateMedia, deleteMedia } from './media';
import inquiryHandler from '../api/inquiry';

const adminTables = new Set([...Object.keys(publicTables), 'media', 'consultation_requests', 'contact_messages', 'activity_logs', 'page_versions']);

export function createApp(db: Pool, options: { origin: string; mediaRoot?: string; dist?: string; secureCookies?: boolean; inquiry?: typeof inquiryHandler }) {
  const origin = new URL(options.origin).origin;
  const secure = options.secureCookies !== false;
  if (secure && !origin.startsWith('https://')) throw new Error('Production SITE_URL must use HTTPS.');
  const app = express();
  app.disable('x-powered-by');
  // Do not trust spoofable forwarding headers. Configure a reviewed proxy rule at deployment.
  const buckets = new Map<string, { count: number; expires: number }>();
  function throttle(key: string, max: number, ms: number) {
    const now=Date.now(); for(const [k,v] of buckets) if(v.expires <= now) buckets.delete(k);
    const entry=buckets.get(key) || {count:0,expires:now+ms};
    if(buckets.size>=10000 || ++entry.count>max) return false;
    buckets.set(key,entry); return true;
  }
  const asyncRoute = (fn: any) => (req: any,res: any,next: any) => Promise.resolve(fn(req,res,next)).catch(next);
  let maintenanceCache = { enabled: false, expires: 0 };
  const maintenanceEnabled = async () => {
    if (Date.now() < maintenanceCache.expires) return maintenanceCache.enabled;
    const [rows]: any = await db.execute('SELECT settings FROM site_settings WHERE id=? LIMIT 1', ['firm_settings']);
    const settings = rows[0]?.settings;
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    maintenanceCache = { enabled: parsed?.maintenance?.enabled === true, expires: Date.now() + 5000 };
    return maintenanceCache.enabled;
  };
  const maintenancePage = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Maintenance | Lalusis &amp; Partners</title><style>body{margin:0;background:#0d0d11;color:#f7f4ee;font-family:Arial,sans-serif}.wrap{min-height:100vh;display:flex;align-items:center;padding:2rem;box-sizing:border-box}.content{max-width:48rem}.brand{color:#c59b63;letter-spacing:.16em;text-transform:uppercase;font-size:.75rem}h1{font-family:Georgia,serif;font-size:clamp(3rem,9vw,6rem);font-weight:400;line-height:.9;margin:1.75rem 0}p{max-width:38rem;line-height:1.6;color:#d8cebe;font-size:1.1rem}</style></head><body><main class="wrap"><div class="content"><div class="brand">Lalusis &amp; Partners</div><h1>We’ll be back shortly.</h1><p>Our website is undergoing scheduled maintenance. Please check back soon.</p></div></main></body></html>';
  app.use((_req,res,next) => {res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');next();});
  app.use('/api', (_req,res,next) => {res.setHeader('Cache-Control','no-store');next();});
  app.use('/api', (req,res,next) => {
    if(!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin !== origin) return res.status(403).json({error:'Invalid request origin.'});
    next();
  });
  app.use('/api/admin', (req,res,next)=>req.method==='GET'?next():requireAdmin(req,res,()=>express.json({limit:'1mb'})(req,res,next)));
  app.use('/api', express.json({limit:'24kb'}));
  app.get('/api/health', asyncRoute(async (_req:any,res:any) => {await db.execute('SELECT 1');res.json({ok:true});}));
  const dummy=hashPassword(newToken());
  app.post('/api/auth/login', asyncRoute(async (req:any,res:any) => {
    if(!throttle('login:'+req.socket.remoteAddress,10,15*60*1000)) return res.status(429).json({error:'Please try again later.'});
    const {email,password}=req.body || {};
    if(typeof email!=='string'||email.length>254||typeof password!=='string'||password.length>256) return res.status(400).json({error:'Invalid credentials.'});
    const [rows]:any=await db.execute('SELECT * FROM app_admins WHERE email=? AND active=1',[email.trim().toLowerCase()]);
    const valid=verifyPassword(password,rows[0]?.password_hash || dummy);
    if(!valid || !rows[0]) return res.status(401).json({error:'Invalid credentials.'});
    const token=newToken();
    await db.execute('DELETE FROM app_sessions WHERE expires_at <= UTC_TIMESTAMP(6)');
    await db.execute('INSERT INTO app_sessions (token_hash,admin_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(6),INTERVAL 8 HOUR))',[tokenHash(token),rows[0].id]);
    res.cookie('lp_session',token,{httpOnly:true,secure,sameSite:'strict',path:'/',maxAge:8*60*60*1000});
    res.json({user:{id:rows[0].id,email:rows[0].email,role:'ADMINISTRATOR'}});
  }));
  const requireAdmin=asyncRoute(async(req:any,res:any,next:any)=>{
    const token=cookieToken(req.headers.cookie);
    if(!/^[a-f0-9]{64}$/.test(token))return res.status(401).json({error:'Sign in required.'});
    const [rows]:any=await db.execute('SELECT a.id,a.email FROM app_sessions s JOIN app_admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP(6) AND a.active=1',[tokenHash(token)]);
    if(!rows[0])return res.status(401).json({error:'Sign in required.'});
    req.admin=rows[0];next();
  });
  app.get('/api/auth/me',requireAdmin,(req:any,res)=>res.json({user:{...req.admin,role:'ADMINISTRATOR'}}));
  app.post('/api/auth/logout',asyncRoute(async(req:any,res:any)=>{
    await db.execute('DELETE FROM app_sessions WHERE token_hash=?',[tokenHash(cookieToken(req.headers.cookie))]);
    res.clearCookie('lp_session',{httpOnly:true,secure,sameSite:'strict',path:'/'});res.json({ok:true});
  }));
  app.post('/api/auth/change-password',requireAdmin,asyncRoute(async(req:any,res:any)=>{
    const {currentPassword,newPassword}=req.body || {};
    if(typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<12||newPassword.length>256) return res.status(400).json({error:'Use a new password with at least 12 characters.'});
    const [rows]:any=await db.execute('SELECT password_hash FROM app_admins WHERE id=? AND active=1',[req.admin.id]);
    if(!rows[0]||!verifyPassword(currentPassword,rows[0].password_hash))return res.status(401).json({error:'Current password is incorrect.'});
    await db.execute('UPDATE app_admins SET password_hash=? WHERE id=?',[hashPassword(newPassword),req.admin.id]);
    await db.execute('DELETE FROM app_sessions WHERE admin_id=? AND token_hash<>?',[req.admin.id,tokenHash(cookieToken(req.headers.cookie))]);
    res.json({ok:true});
  }));
  app.get('/api/content/:table',asyncRoute(async(req:any,res:any)=>{
    if (req.params.table !== 'site_settings' && await maintenanceEnabled()) return res.status(503).json({error:'The website is temporarily undergoing maintenance.'});
    const filter=Object.prototype.hasOwnProperty.call(publicTables,req.params.table)?publicTables[req.params.table]:null;
    if(!filter)return res.status(404).json({error:'Not found.'});
    const [rows]:any=await db.query('SELECT * FROM `'+req.params.table+'` WHERE '+filter+' LIMIT 1000');
    res.json({data:sanitizePublicRows(req.params.table,rows)});
  }));
  app.get('/api/admin/system-status',requireAdmin,asyncRoute(async(_req:any,res:any)=>{
    await db.execute('SELECT 1');
    let mediaWritable=false;
    if(options.mediaRoot){try{await access(options.mediaRoot,fsConstants.R_OK|fsConstants.W_OK);mediaWritable=true;}catch{}}
    res.json({database:true,mediaConfigured:Boolean(options.mediaRoot),mediaWritable,smtpConfigured:Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASSWORD),checkedAt:new Date().toISOString()});
  }));
  app.get('/api/admin/backup',requireAdmin,asyncRoute(async(_req:any,res:any)=>{
    const tables=['site_settings','pages','page_versions','attorneys','practice_areas','articles','news','faqs','faq_categories','navigation','consultation_requests','contact_messages','media','activity_logs'];
    const data:Record<string,unknown>={};
    for(const table of tables){const [rows]:any=await db.query('SELECT * FROM `'+table+'` LIMIT 10000');data[table]=normalize(rows);}
    res.json({format:'lalusis-cms-mysql-backup-v1',createdAt:new Date().toISOString(),data});
  }));
  app.get('/api/admin/:table',requireAdmin,asyncRoute(async(req:any,res:any)=>{
    if(!adminTables.has(req.params.table))return res.status(404).json({error:'Not found.'});
    const [rows]:any=await db.query('SELECT * FROM `'+req.params.table+'` LIMIT 1000');res.json({data:normalize(rows)});
  }));
  let uploads=0;
  app.post('/api/admin/media/upload',requireAdmin,asyncRoute(async(req:any,res:any)=>{
    if(uploads>=2)return res.status(429).json({error:'Please wait for the current upload to finish.'});
    uploads++;
    try{await uploadMedia(db,options.mediaRoot,req,res);}finally{uploads--;}
  }));
  app.post('/api/admin/media/:id/update',requireAdmin,asyncRoute((req:any,res:any)=>updateMedia(db,req,res)));
  app.post('/api/admin/media/:id/delete',requireAdmin,asyncRoute((req:any,res:any)=>deleteMedia(db,options.mediaRoot,req,res)));
  app.get('/media/:id',asyncRoute((req:any,res:any)=>serveMedia(db,options.mediaRoot,req,res)));
  app.post('/api/admin/:table',requireAdmin,asyncRoute(async(req:any,res:any)=>{
    if(!adminTables.has(req.params.table))return res.status(404).json({error:'Not found.'});
    const data = await writeContent(db,req.params.table,req.body);
    if (req.params.table === 'site_settings') maintenanceCache.expires = 0;
    res.json({data});
  }));
  const inquiry=options.inquiry || inquiryHandler;
  app.all('/api/inquiry', (req,res,next)=>{
    if(req.method==='POST'&&!throttle('inquiry:'+req.socket.remoteAddress,5,60000))return res.status(429).json({error:'Please wait a minute before submitting again.'});
    // The existing handler compares Origin to Host; use the configured public origin behind proxies.
    req.headers.host=new URL(origin).host;
    return Promise.resolve(inquiry(req,res)).catch(next);
  });
  app.use('/api',(_req,res)=>res.status(404).json({error:'Not found.'}));
  const dist=path.resolve(options.dist || 'dist');
  app.get(/^\/partners(?:\/(.*))?$/, (req,res)=>res.redirect(301,'/attorneys'+(req.params[0]?'/'+encodeURIComponent(req.params[0]):'')));
  app.get(/^\/admin(?:\/.*)?$/,(_req,res)=>{res.setHeader('X-Robots-Tag','noindex, nofollow');res.sendFile(path.join(dist,'admin.html'));});
  app.use(asyncRoute(async(req:any,res:any,next:any)=>{
    if (req.method === 'GET' || req.method === 'HEAD') {
      const acceptsHtml = String(req.headers.accept || '').includes('text/html');
      if (acceptsHtml && await maintenanceEnabled()) {
        res.status(503).setHeader('Retry-After','3600').setHeader('Cache-Control','no-store').send(maintenancePage);
        return;
      }
    }
    next();
  }));
  app.use(express.static(dist,{extensions:['html'],redirect:false,dotfiles:'deny'}));
  app.use((_req,res)=>{res.status(404);res.setHeader('X-Robots-Tag','noindex');const file=path.join(dist,'404.html');existsSync(file)?res.sendFile(file):res.send('Not found');});
  app.use((err:any,_req:any,res:any,_next:any)=>{const status=[400,404,413,415,503].includes(err.status)?err.status:err.code==='ER_DUP_ENTRY'?409:err.type==='entity.too.large'?413:err.type==='entity.parse.failed'?400:500;console.error('Backend request failed:',err.code || err.type || 'internal');res.status(status).json({error:err.expose?err.message:status===500?'Service temporarily unavailable.':'Invalid request.'});});
  return app;
}
