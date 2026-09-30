import React from 'react';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

const cache = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {value: {
  getItem: (key: string) => cache.get(key) ?? null,
  setItem: (key: string, value: string) => cache.set(key, value),
  removeItem: (key: string) => cache.delete(key),
}});
const { SectionRenderer } = await import('../src/components/public/SectionRenderer');
const { BlockInspector } = await import('../src/components/admin/builder/BlockInspector');
const { ToastProvider } = await import('../src/components/ui/Toast');
const { chamberFields } = await import('../src/components/admin/builder/editableContentFields');
const render = (node: React.ReactNode) => renderToStaticMarkup(<ToastProvider>{node}</ToastProvider>);
const content = Object.fromEntries(chamberFields.map(([key]) => [key, `Edited-${key}`]));
const section: any = {id:'test',type:'contactInfo',title:'Chambers',content,order:1,isVisible:true};
const html = render(<SectionRenderer section={section} onNavigate={() => {}} />);
for (const [key] of chamberFields) assert.ok(html.includes(`Edited-${key}`), `${key} appears on public page`);
assert.ok(html.includes('Submit Inquiry to Managing Partner'), 'inquiry submit action stays fixed');
const inspector = render(<BlockInspector section={section} index={0} totalSections={1} activePart="cards" onUpdate={() => {}} onDuplicate={() => {}} onDelete={() => {}} onClose={() => {}} />);
for (const [key] of chamberFields) assert.ok(inspector.includes(`Edited-${key}`), `${key} is editable`);
const cleared = render(<SectionRenderer section={{...section,content:{...content,secondaryPhone:'',addressNote:''}}} onNavigate={() => {}} />);
assert.ok(!cleared.includes('By Appointment'), 'cleared optional text does not restore defaults');
const image = render(<SectionRenderer section={{...section,type:'imageText',content:{imageUrl:'/office.jpg',imageEyebrow:'New Badge',imageCaption:'New Location',imageAlt:'New Office'}}} onNavigate={() => {}} />);
for (const text of ['New Badge','New Location','New Office','/office.jpg']) assert.ok(image.includes(text));
cache.set('lp_cms_attorneys_v1',JSON.stringify([{id:'edited',slug:'edited',fullName:'Edited Partner',professionalTitle:'Custom Role',primarySpecialization:'Custom Practice',isPublished:true,order:1,barAdmissions:['Custom Bar'],education:['Custom Degree'],awards:['Custom Award'],homeCardImageUrl:'/card.jpg',homeModalImageUrl:'/popup.jpg',partnerPageImageUrl:'/partner.jpg'}]));
const partners = render(<SectionRenderer section={{...section,type:'attorneys',content:{cardAction:'Edited Action',cardHint:'Edited Hint'}}} onNavigate={() => {}} />);
for (const text of ['Custom Role','Custom Bar','Custom Degree','Custom Award','Edited Action','Edited Hint','/card.jpg']) assert.ok(partners.includes(text),text);
console.log('PASS: all chamber fields render and are editable, optional clearing, image captions, partner card records, fixed inquiry action');

const { VideoUploadField } = await import('../src/components/ui/VideoUploadField');
const { MediaLibrary } = await import('../src/components/admin/MediaLibrary');
cache.set('lp_cms_media_v1',JSON.stringify([
  {id:'video',name:'Chambers Video',url:'https://example.test/chambers.webm',fileType:'video',category:'general',altText:'Chambers'},
  {id:'image',name:'Image Only',url:'https://example.test/photo.jpg',fileType:'image',category:'portrait',altText:'Portrait'},
]));
const picker = render(<VideoUploadField value="https://example.test/chambers.webm" onChange={() => {}} />);
assert.ok(picker.includes('Chambers Video'));
assert.ok(picker.includes('Upload video from computer'),'desktop upload is prominent');
assert.ok(picker.includes('maximum 100 MB'),'video upload shows the updated limit');
assert.ok(picker.includes('type="file"'),'desktop file chooser is present');
assert.ok(picker.includes('Or paste a video link (optional)'),'URL is an optional alternative');
assert.ok(!picker.includes('Image Only'),'video picker excludes images');
assert.ok(picker.includes('preload="none"'),'preview does not download every video eagerly');
const library = render(<MediaLibrary />);
assert.ok(library.includes('<video'),'library displays a video player');
assert.ok(!library.includes('<img src="https://example.test/chambers.webm"'),'video assets are not rendered as images');
console.log('PASS: video library preview, video-only selection and deferred loading');
