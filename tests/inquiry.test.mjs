import assert from 'node:assert/strict';
import handler from '../api/inquiry.ts';
process.env.RESEND_API_KEY = 'test-key';
process.env.INQUIRY_EMAIL_FROM = 'Test <intake@example.com>';
process.env.INQUIRY_EMAIL_TO = 'lalusispartners@gmail.com';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon';
let calls = [];
let dbStatus = 201;
let mailStatus = 200;
globalThis.fetch = async (url, options) => {
  calls.push({url, ...options, payload: JSON.parse(options.body)});
  return url.includes('supabase')
    ? new Response(dbStatus === 409 ? JSON.stringify({code:'23505'}) : '{}', {status:dbStatus})
    : new Response(JSON.stringify(mailStatus === 200 ? {id:'email-test'} : {message:'denied'}), {status:mailStatus});
};
let ip=0;
async function send(body, extra = {}) {
  let result;
  const req = {method:'POST', headers:{host:'example.com',origin:'https://example.com','content-type':'application/json','x-forwarded-for':String(++ip)}, body, ...extra};
  const res = {statusCode:200, setHeader(){}, end(text){result={status:this.statusCode, body:JSON.parse(text)}}};
  await handler(req,res);
  return result;
}
const data = {requestId:'d045b7be-93bf-4a63-94c9-78b68ddab786',kind:'consultation',fullName:'Test Visitor',email:'visitor@example.com',company:'Test Company',practiceArea:'Corporate',urgency:'Standard',preferredDate:'2026-10-01',preferredTime:'Morning',message:'TEST inquiry',consent:true};
const success = await send(data);
assert.equal(success.status,200);
assert.equal(calls.length,2);
assert.ok(calls[0].url.endsWith('/consultation_requests'));
assert.equal(calls[0].payload.company_name, 'Test Company');
assert.match(calls[0].payload.brief_concern,/Corporate/);
assert.deepEqual(calls[1].payload.to,['lalusispartners@gmail.com']);
assert.equal(calls[1].payload.reply_to,'visitor@example.com');
assert.match(calls[1].payload.text,/2026-10-01/);
const emailKey = calls[1].headers['Idempotency-Key'];
calls=[];dbStatus=409;
assert.equal((await send(data)).status,200);
assert.equal(calls[1].headers['Idempotency-Key'], emailKey, 'unchanged retries deduplicate email');
calls=[];dbStatus=201;
assert.equal((await send({...data,kind:'contact',to:'attacker@example.com'})).status,200);
assert.ok(calls[0].url.endsWith('/contact_messages'));
assert.deepEqual(calls[1].payload.to,['lalusispartners@gmail.com'],'client cannot select recipient');
calls=[];
assert.equal((await send({...data,email:'bad\r\nBcc: attacker@example.com'})).status,400);
assert.equal((await send({...data,consent:false})).status,400);
assert.equal((await send({...data,message:'x'.repeat(10001)})).status,400);
assert.equal((await send(data,{method:'GET'})).status,405);
assert.equal((await send(data,{headers:{host:'example.com',origin:'https://other.com','content-type':'application/json'}})).status,403);
assert.equal(calls.length,0);
dbStatus=403;
assert.equal((await send(data)).status,502);
assert.equal(calls.length,1,'no email if database persistence failed');
calls=[];dbStatus=201;mailStatus=422;
assert.equal((await send(data)).status,502,'no success when email is rejected');
delete process.env.RESEND_API_KEY;calls=[];
assert.equal((await send(data)).status,503);
assert.equal(calls.length,0,'missing config must not falsely accept inquiry');
console.log('PASS: both inbox routes, email fields, retry deduplication, validation, and failure handling');
