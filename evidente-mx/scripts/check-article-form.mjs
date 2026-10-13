import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = Module.createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const browser = new JSDOM('<div id="root"></div>', { url: 'https://editor-test.invalid' });
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Event']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: browser.window[name] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const aliases = {
  'next/navigation': { useRouter: () => ({ push() {}, refresh() {} }) },
  'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
  '@/lib/supabase/client': { createClient() { throw new Error('Test must not write data'); } },
  '@/app/admin/actions': { refreshPublicContent() { throw new Error('Test must not invalidate production'); } },
  './ImageUploader': { ImageUploader: () => null },
};
function loadTs(relativePath) {
  const filename = path.join(root, relativePath);
  const loaded = new Module(filename);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => aliases[name]
    || (name.startsWith('@/lib/') ? loadTs(`src/lib/${name.slice(6)}.ts`) : originalRequire(name));
  loaded._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename);
  return loaded.exports;
}

// Componente y eventos reales de React; sólo router, subida y escrituras están aislados.
const { ArticleForm } = loadTs('src/components/admin/ArticleForm.tsx');
const mounted = createRoot(document.getElementById('root'));
const title = () => document.querySelector('input[placeholder="Escribe un título atractivo..."]');
const slug = () => document.querySelector('input[placeholder="url-del-articulo"]');
async function change(input, value) {
  await act(async () => {
    const prototype = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

try {
  await act(async () => mounted.render(React.createElement(ArticleForm, { key: 'new' })));
  const heading = 'Rescatan aves en Chihuahua';
  for (let length = 1; length <= heading.length; length++) await change(title(), heading.slice(0, length));
  assert.equal(slug().value, 'rescatan-aves-en-chihuahua');
  await change(slug(), 'ruta-manual');
  await change(title(), 'Otra noticia');
  assert.equal(slug().value, 'ruta-manual');
  await change(slug(), '');
  await change(title(), 'Regresa el automático');
  assert.equal(slug().value, 'regresa-el-automatico');

  const content = document.querySelector('textarea[placeholder^="Escribe el contenido"]');
  await change(content, '<p>Texto válido</p><img src=x onerror=alert(1)><a href="java&#x73;cript:alert(1)">Enlace</a>');
  const preview = [...document.querySelectorAll('button')].find(button => button.textContent === 'Vista previa');
  await act(async () => preview.click());
  const displayed = document.querySelector('.prose');
  assert.equal(displayed.querySelector('img').hasAttribute('onerror'), false);
  assert.equal(displayed.querySelector('a').hasAttribute('href'), false);
  assert.ok(displayed.textContent.includes('Texto válido'));

  await act(async () => mounted.render(React.createElement(ArticleForm, {
    key: 'existing', isEditing: true,
    article: { id: 'test', title: 'Título original', slug: 'direccion-existente' },
  })));
  await change(title(), 'Título actualizado');
  assert.equal(slug().value, 'direccion-existente');
  process.stdout.write('Formulario: slug completo al escribir, manual/existente conservados, automático recuperable y vista previa segura.\n');
} finally {
  await act(async () => mounted.unmount());
  browser.window.close();
}
