import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = readFileSync(new URL('../src/services/db.ts', import.meta.url), 'utf8');
const seedNames = source.match(/import \{([\s\S]*?)\} from '.\/seedData';/)[1].match(/initial\w+/g);
const cache = new Map();
let writes = 0;
let cloudMedia = [];
let succeeds = true;
let privateReads = 0;
let resolvePrivateRead;
const service = new Proxy({
  checkSchemaReady: async () => true,
  getMedia: async () => cloudMedia,
  getConsultations: async () => { privateReads++; return [{id:'private-client'}]; },
  getContactMessages: async () => [],
  subscribeToRealtimeChanges: () => () => {},
  saveAttorney: async () => { writes++; return succeeds; },
  savePage: async () => { writes++; return succeeds; },
  deleteMedia: async () => { writes++; return succeeds; },
}, { get: (target, key) => target[key] || (async () => null) });
const context = vm.createContext({ console, structuredClone, supabaseService: service, isSupabaseConfigured: true,
  localStorage: { getItem: k => cache.get(k), setItem: (k,v) => cache.set(k,v), removeItem: k => cache.delete(k) },
  ...Object.fromEntries(seedNames.map(n => [n, n === 'initialUsers' ? [{id:'u',name:'Admin',role:'admin'}] : []])),
});
const executable = stripTypeScriptTypes(source.replace(/import[\s\S]*?from ['"][^'"]+['"];\s*/g, '').replace('export const db =', 'globalThis.db ='));
vm.runInContext(executable, context);
const {db} = context;
await new Promise(resolve => setTimeout(resolve, 0));
cache.set('lp_cms_media_v1', JSON.stringify([{id:'old',url:'old.svg'}]));
await db.refreshFromSupabase();
assert.equal(db.getMedia().length, 0, 'empty cloud library clears stale cached media');
assert.equal(writes, 0, 'reading cloud data must never recreate media');
cloudMedia = [{id:'kept',url:'kept.jpg'}];
await db.refreshFromSupabase();
assert.equal(db.getMedia()[0].id, 'kept');
await db.deleteMedia('kept');
assert.equal(db.getMedia().length, 0, 'deleted media stays deleted on repeated reads');
succeeds = false;
await assert.rejects(db.saveAttorney({id:'a', homeCardImageUrl:'new.jpg'}));
assert.equal(db.getAttorneys().length, 0, 'failed cloud save cannot appear locally published');
await assert.rejects(db.savePage({id:'p',sections:[]}));
cache.set('lp_cms_media_v1', JSON.stringify([{id:'keep'}]));
await assert.rejects(db.deleteMedia('keep'));
assert.equal(db.getMedia().length, 1, 'failed cloud deletion retains the item');
succeeds = true;
await db.saveAttorney({id:'a',homeCardImageUrl:'card.jpg',homeModalImageUrl:'popup.jpg',partnerPageImageUrl:'partner.jpg'});
assert.equal(db.getAttorneys()[0].homeModalImageUrl, 'popup.jpg');
console.log('PASS: cloud authority, empty library, no resurrection, and confirmed writes');

context.initialPages.push(...['', 'about', 'attorneys', 'practice-areas', 'contact'].map((slug) => ({id: 'page-' + slug, slug, sections: [{id:'original'}]})));
context.initialNavigation.push(...['/', '/about', '/attorneys', '/practice-areas', '/contact'].map((path, i) => ({id:'nav-' + i, path, label:path, isVisible:true, order:i+1})));
cache.set('lp_cms_pages_v1', '[]');
cache.set('lp_cms_nav_v1', '[]');
assert.equal(db.getPages().length, 5, 'empty cloud pages retain the five core routes');
assert.equal(db.getNavigation().length, 5, 'empty cloud navigation retains the five core links');
cache.set('lp_cms_pages_v1', JSON.stringify([{id:'custom-about',slug:'about',sections:[{id:'user-edit'}]}]));
assert.equal(db.getPages().find(p => p.slug === 'about').sections[0].id, 'user-edit', 'saved page sections are preserved');
cache.set('lp_cms_nav_v1', JSON.stringify([{id:'custom-partners',path:'/partners',label:'Our Partners',isVisible:true,order:3}]));
assert.equal(db.getNavigation().length, 5, 'partners alias must not produce duplicate links');
const writesBeforeReads = writes;
db.getPages(); db.getNavigation(); db.getMedia();
assert.equal(writes, writesBeforeReads, 'restoring the core layout does not write media or defaults to the cloud');
console.log('PASS: core routes and navigation restored without replacing saved content');

assert.equal(privateReads,0,'public browsing does not request private inquiries');
cache.set('lp_cms_consultations_v1', JSON.stringify([{id:'old-private-client'}]));
db.setVerifiedAdmin({id:'approved',email:'owner@example.test',role:'ADMINISTRATOR'});
assert.equal(cache.has('lp_cms_consultations_v1'),false,'old private localStorage is removed');
await db.refreshFromSupabase();
assert.equal(db.getConsultationRequests()[0].id,'private-client');
assert.equal(cache.has('lp_cms_consultations_v1'),false,'private inquiries never persist in localStorage');
service.getConsultations = () => new Promise(resolve => {resolvePrivateRead=resolve;});
const pending = db.refreshFromSupabase();
await new Promise(resolve=>setTimeout(resolve,0));
db.setVerifiedAdmin(null);
assert.equal(db.getConsultationRequests().length,0,'logout removes private inquiries');
resolvePrivateRead([{id:'late-private-client'}]);
await pending;
assert.equal(db.getConsultationRequests().length,0,'in-flight queries cannot restore data after logout');
console.log('PASS: private cache purge, public isolation and logout race protection');

cache.set('lp_cms_pages_v1', JSON.stringify([{id:'home',slug:'home',sections:[{id:'hero',content:{videos:[
  {videoUrl:'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',duration:'03:45'},
  {videoUrl:'https://example.test/custom.mp4',duration:'02:00'},
]}}]}]));
const videos = db.getPages().find(page=>page.id==='home').sections[0].content.videos;
assert.equal(videos[0].videoUrl,'/videos/news-1.mp4','existing sample links use the bundled news clip');
assert.equal(videos[0].duration,'00:16');
assert.equal(videos[1].videoUrl,'https://example.test/custom.mp4','custom video choices stay intact');
console.log('PASS: bundled demo clips replace cached samples while custom videos are preserved');
