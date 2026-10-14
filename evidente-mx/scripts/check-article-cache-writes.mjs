import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = Module.createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const tags = [];
const modules = new Map();
function loadTs(relativePath) {
  if (modules.has(relativePath)) return modules.get(relativePath);
  const filename = path.join(root, relativePath);
  const loaded = new Module(filename);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => name === 'next/cache' ? { revalidateTag: tag => tags.push(tag) }
    : name.startsWith('@/lib/') ? loadTs(`src/lib/${name.slice(6)}.ts`) : originalRequire(name);
  loaded._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  modules.set(relativePath, loaded.exports);
  return loaded.exports;
}

const article = {
  id: 'test-article', title: 'Noticia para comprobar la caché', slug: 'direccion-anterior',
  summary: 'Un resumen suficientemente largo para una publicación de prueba aislada.',
  content: 'Contenido válido de la noticia de prueba. '.repeat(10), category: 'Noticias', is_published: true,
};
let existing = article;
let failed = false;
let writes = 0;
const originalFetch = globalThis.fetch;
const keys = ['API_SECRET_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const originalEnv = Object.fromEntries(keys.map(key => [key, process.env[key]]));
process.env.API_SECRET_KEY = 'cache-test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://cache-writes.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'cache-test-service-key';

// Handlers, validación y SDK reales; ninguna request sale a Supabase.
globalThis.fetch = async (input, init) => {
  assert.equal(new URL(input).hostname, 'cache-writes.invalid');
  const method = init.method;
  if (method !== 'GET') writes++;
  if (failed) return new Response(JSON.stringify({ code: 'XX000', message: 'Simulated database failure' }), { status: 503 });
  const rows = method === 'POST' ? JSON.parse(init.body)
    : method === 'PATCH' ? [{ ...existing, ...JSON.parse(init.body) }] : existing ? [existing] : [];
  const single = init.headers.get('Accept')?.includes('vnd.pgrst.object+json');
  return new Response(JSON.stringify(single ? rows[0] ?? null : rows), { headers: { 'Content-Type': 'application/json' } });
};
const request = (method, body, authorized = true) => new NextRequest('https://example.test/api/articles/test-article', {
  method, headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: 'Bearer cache-test-api-key' } : {}) },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const context = { params: Promise.resolve({ id: article.id }) };

try {
  const { POST } = loadTs('src/app/api/articles/route.ts');
  const { PATCH, DELETE } = loadTs('src/app/api/articles/[id]/route.ts');
  async function check(label, call, status, expectedTags) {
    tags.length = 0;
    const response = await call();
    assert.equal(response.status, status, label);
    assert.deepEqual(tags, expectedTags, label);
  }
  for (const published of [false, true]) {
    await check(`POST ${published ? 'publicado' : 'borrador'}`,
      () => POST(request('POST', { ...article, is_published: published })), 201,
      published ? ['articles:list', 'article:direccion-anterior'] : []);
  }
  await check('Lote mixto', () => POST(request('POST', [
    { ...article, slug: 'nuevo-publicado' }, { ...article, slug: 'nuevo-borrador', is_published: false },
  ])), 201, ['articles:list', 'article:nuevo-publicado']);
  existing = { ...article, is_published: false };
  await check('Editar borrador', () => PATCH(request('PATCH', { summary: article.summary }), context), 200, []);
  await check('Publicar borrador', () => PATCH(request('PATCH', { is_published: true }), context), 200,
    ['articles:list', 'article:direccion-anterior']);
  existing = article;
  await check('Editar publicado sin cambio de URL', () => PATCH(request('PATCH', { summary: article.summary }), context), 200,
    ['articles:list', 'article:direccion-anterior']);
  await check('Renombrar publicado', () => PATCH(request('PATCH', { title: 'Otra noticia con direccion nueva' }), context), 200,
    ['articles:list', 'article:direccion-anterior', 'article:otra-noticia-con-direccion-nueva']);
  await check('Retirar publicado', () => PATCH(request('PATCH', { is_published: false }), context), 200,
    ['articles:list', 'article:direccion-anterior']);
  for (const published of [false, true]) {
    existing = { ...article, is_published: published };
    await check(`DELETE ${published ? 'publicado' : 'borrador'}`, () => DELETE(request('DELETE'), context), 200,
      published ? ['articles:list', 'article:direccion-anterior'] : []);
  }
  existing = null;
  await check('Ausente', () => DELETE(request('DELETE'), context), 404, []);
  existing = article;
  for (const [method, call] of [
    ['POST', auth => POST(request('POST', article, auth))],
    ['PATCH', auth => PATCH(request('PATCH', { summary: article.summary }, auth), context)],
    ['DELETE', auth => DELETE(request('DELETE', undefined, auth), context)],
  ]) {
    const writesBefore = writes;
    await check(`${method} sin autorización`, () => call(false), 401, []);
    assert.equal(writes, writesBefore);
    failed = true;
    await check(`${method} fallido`, () => call(true), 500, []);
    failed = false;
  }
  const writesBefore = writes;
  await check('Payload inválido', () => POST(request('POST', { title: 'Corto' })), 400, []);
  assert.equal(writes, writesBefore);
  process.stdout.write('API: borradores, publicar, editar, renombrar, retirar, borrar y fallos invalidan sólo lo debido. Sin red.\n');
} finally {
  globalThis.fetch = originalFetch;
  for (const key of keys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
}
