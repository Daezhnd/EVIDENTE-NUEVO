import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = Module.createRequire(import.meta.url);
const { JSDOM } = Module.createRequire(require.resolve('isomorphic-dompurify'))('jsdom');
const browser = new JSDOM('<div id="root"></div>', { url: 'https://editor-test.invalid' });
for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'Event']) {
  Object.defineProperty(globalThis, name, { configurable: true, value: browser.window[name] });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const writes = [];
const invalidations = [];
const navigations = [];
let writeError = null;
let readError = null;
let databaseArticle = null;
let writeResult;
const aliases = {
  'next/navigation': { useRouter: () => ({ push(url) { navigations.push(url); }, refresh() {} }) },
  'next/link': { default: ({ children, href }) => React.createElement('a', { href }, children) },
  '@/lib/supabase/client': {
    createClient: () => ({
      from(table) {
        assert.equal(table, 'articles');
        let write;
        let filter;
        let selection;
        return {
          insert(rows) { write = { type: 'insert', data: rows[0] }; writes.push(write); return this; },
          update(data) { write = { type: 'update', data }; writes.push(write); return this; },
          eq(column, value) { filter = [column, value]; if (write) write.filter = filter; return this; },
          select(columns) { selection = columns; return this; },
          maybeSingle() { return this; },
          async throwOnError() {
            assert.equal(selection, 'slug,is_published');
            assert.deepEqual(filter, ['id', validArticle.id]);
            if (readError) throw readError;
            return { data: databaseArticle, error: null };
          },
          async single() {
            assert.equal(selection, 'slug,is_published');
            return { data: writeResult === undefined ? write.data : writeResult, error: writeError };
          },
        };
      },
    }),
  },
  '@/app/admin/actions': { async refreshPublicContent(...args) { invalidations.push(args); } },
  './ImageUploader': { ImageUploader: () => null },
};
globalThis.fetch = () => { throw new Error('Form tests must not access the network'); };
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
const validArticle = {
  id: 'article-test', title: 'Una noticia válida de Chihuahua', slug: 'noticia-original',
  summary: 'Resumen válido para probar el formulario.',
  content: '<p>Contenido válido con suficiente texto para superar la validación del formulario sin publicar datos reales.</p>',
  is_published: false,
};
async function prepareSubmit(key, article) {
  writes.length = invalidations.length = navigations.length = 0;
  writeError = null;
  readError = null;
  databaseArticle = article || null;
  writeResult = undefined;
  await act(async () => mounted.render(React.createElement(ArticleForm, {
    key, article, isEditing: Boolean(article),
  })));
  if (!article) {
    await change(title(), validArticle.title);
    await change(document.querySelector('textarea[placeholder^="Un breve resumen"]'), validArticle.summary);
    await change(document.querySelector('textarea[placeholder^="Escribe el contenido"]'), validArticle.content);
  }
}
async function submit(publish = false) {
  await act(async () => {
    if (publish) {
      [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Publicar ahora').click();
    } else {
      document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
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

  await prepareSubmit('new-draft');
  await submit();
  assert.equal(writes[0].type, 'insert');
  assert.equal(writes[0].data.is_published, false);
  assert.deepEqual(invalidations, []);
  assert.deepEqual(navigations, ['/admin/articulos']);

  await prepareSubmit('existing-draft', validArticle);
  await submit();
  assert.equal(writes[0].type, 'update');
  assert.deepEqual(writes[0].filter, ['id', validArticle.id]);
  assert.deepEqual(invalidations, []);

  await prepareSubmit('publish-new');
  await submit(true);
  assert.equal(writes[0].data.is_published, true);
  assert.deepEqual(invalidations, [['articles', ['una-noticia-valida-de-chihuahua']]]);

  await prepareSubmit('rename-published', { ...validArticle, is_published: true });
  await change(slug(), 'noticia-renombrada');
  await submit(true);
  assert.equal(writes[0].data.slug, 'noticia-renombrada');
  assert.deepEqual(invalidations, [['articles', ['noticia-original', 'noticia-renombrada']]]);

  await prepareSubmit('withdraw-published', { ...validArticle, is_published: true });
  await change(slug(), 'nuevo-borrador');
  await submit();
  assert.equal(writes[0].data.is_published, false);
  assert.deepEqual(invalidations, [['articles', ['noticia-original']]]);

  await prepareSubmit('externally-published', validArticle);
  databaseArticle = { ...validArticle, is_published: true, slug: 'publicado-por-api' };
  await submit();
  assert.equal(writes[0].data.is_published, false);
  assert.deepEqual(invalidations, [['articles', ['publicado-por-api']]]);

  await prepareSubmit('externally-withdrawn', { ...validArticle, is_published: true });
  databaseArticle = validArticle;
  await submit();
  assert.deepEqual(invalidations, []);

  await prepareSubmit('database-returned-slug');
  writeResult = { slug: 'direccion-devuelta-por-db', is_published: true };
  await submit(true);
  assert.deepEqual(invalidations, [['articles', ['direccion-devuelta-por-db']]]);

  for (const article of [undefined, { ...validArticle, is_published: true }]) {
    await prepareSubmit(article ? 'update-denied' : 'insert-denied', article);
    writeError = { message: 'Permiso denegado por RLS', code: '42501', hint: 'Sin cambios guardados' };
    await submit(true);
    assert.equal(writes.length, 1);
    assert.deepEqual(invalidations, []);
    assert.deepEqual(navigations, []);
    assert.ok(document.body.textContent.includes('Permiso denegado por RLS (Sin cambios guardados) [42501]'));
    assert.equal([...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Publicar ahora').disabled, false);
  }

  await prepareSubmit('read-denied', validArticle);
  readError = { message: 'Lectura denegada por RLS', code: '42501', hint: 'Sin cambios guardados' };
  await submit(true);
  assert.deepEqual(writes, []);
  assert.deepEqual(invalidations, []);
  assert.deepEqual(navigations, []);
  assert.ok(document.body.textContent.includes('Lectura denegada por RLS (Sin cambios guardados) [42501]'));

  await prepareSubmit('missing-record', validArticle);
  databaseArticle = null;
  await submit(true);
  assert.deepEqual(writes, []);
  assert.deepEqual(invalidations, []);
  assert.deepEqual(navigations, []);
  assert.ok(document.body.textContent.includes('Artículo no encontrado o sin permisos para editarlo'));

  await prepareSubmit('zero-returned-rows');
  writeResult = null;
  await submit(true);
  assert.equal(writes.length, 1);
  assert.deepEqual(invalidations, []);
  assert.deepEqual(navigations, []);
  assert.ok(document.body.textContent.includes('No se pudo confirmar el artículo guardado'));

  await prepareSubmit('invalid-input');
  await change(title(), 'Corto');
  await submit(true);
  assert.deepEqual(writes, []);
  assert.deepEqual(invalidations, []);
  assert.ok(document.body.textContent.includes('El título debe tener al menos 10 caracteres'));
  process.stdout.write('Formulario: slug y vista previa seguros; invalidación basada en estado actual y fila guardada; borradores, errores RLS, ausencia de filas y validación no invalidan.\n');
} finally {
  await act(async () => mounted.unmount());
  browser.window.close();
}
