import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = readFileSync(new URL('../src/lib/adminAuth.ts',import.meta.url),'utf8');
let user = null;
let approved = false;
let error = null;
const context = vm.createContext({isSupabaseConfigured:true,supabase:{
 auth:{getUser:async()=>({data:{user},error:null})},
 rpc:async()=>({data:approved,error}),
}});
vm.runInContext(stripTypeScriptTypes(source.replace(/import[^;]+;\s*/g,'').replace('export async function','async function')),context);
assert.equal(await context.getApprovedAdmin(),null);
user = {id:'admin',email:'owner@example.test',user_metadata:{role:'SUPER_ADMIN'},created_at:'now'};
assert.equal(await context.getApprovedAdmin(),null,'editable metadata cannot grant admin');
approved = true;
assert.equal((await context.getApprovedAdmin()).id,'admin');
error = {message:'Permission lookup failed'};
assert.equal(await context.getApprovedAdmin(),null,'failed permission lookup denies access');
context.isSupabaseConfigured = false;
assert.equal(await context.getApprovedAdmin(),null,'unconfigured websites cannot use demo access');
console.log('PASS: approved admin only; missing auth/config, forged roles and RPC errors denied');
