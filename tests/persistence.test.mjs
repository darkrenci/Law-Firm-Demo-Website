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
const service = new Proxy({
  checkSchemaReady: async () => true,
  getMedia: async () => cloudMedia,
  subscribeToRealtimeChanges: () => () => {},
  saveAttorney: async () => { writes++; return succeeds; },
  savePage: async () => { writes++; return succeeds; },
  deleteMedia: async () => { writes++; return succeeds; },
}, { get: (target, key) => target[key] || (async () => null) });
const context = vm.createContext({ console, structuredClone, supabaseService: service, isSupabaseConfigured: true,
  localStorage: { getItem: k => cache.get(k), setItem: (k,v) => cache.set(k,v) },
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
