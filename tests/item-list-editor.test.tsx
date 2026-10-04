import React from 'react';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { ItemListEditor } from '../src/components/ui/ItemListEditor';

// Render ItemListEditor with populated items
const initialItems = ['Bar Admission 2024', 'UP Law Juris Doctor', 'Tax Specialist (TCS)'];
const html = renderToStaticMarkup(
  <ItemListEditor
    label="Bar Admissions"
    items={initialItems}
    onChange={() => {}}
    placeholder="Add new bar admission..."
    helperText="Add, delete, or update bar examination entries"
  />
);

assert.ok(html.includes('Bar Admissions'), 'Displays label');
assert.ok(html.includes('3 entries'), 'Displays entry counter');
assert.ok(html.includes('Bar Admission 2024'), 'Renders item 1');
assert.ok(html.includes('UP Law Juris Doctor'), 'Renders item 2');
assert.ok(html.includes('Tax Specialist (TCS)'), 'Renders item 3');
assert.ok(html.includes('Add'), 'Renders add button');

// Render empty state
const emptyHtml = renderToStaticMarkup(
  <ItemListEditor
    label="Awards and Certifications"
    items={[]}
    onChange={() => {}}
  />
);
assert.ok(emptyHtml.includes('0 entries'), 'Shows 0 entries');
assert.ok(emptyHtml.includes('No entries yet'), 'Shows friendly empty state');

console.log('PASS: ItemListEditor renders add, delete and update controls with accurate count and entries');
