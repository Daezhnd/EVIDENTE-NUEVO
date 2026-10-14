import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const require = Module.createRequire(import.meta.url);
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const aliases = {
  '@/lib/env': { env: { supabase: { url: 'https://public-cache.invalid', anonKey: 'public-test-key' } } },
  '@/lib/sanitize': { sanitizeHtml: html => html },
  'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
};
const components = new Proxy({}, { get: () => () => null });
function loadTs(relativePath) {
  const filename = path.join(root, relativePath);
  const loaded = new Module(filename);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => aliases[name]
    || (name.startsWith('@/components/') ? components
      : name.startsWith('@/lib/') ? loadTs(`src/lib/${name.slice(6)}.ts`) : originalRequire(name));
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  loaded._compile(outputText, filename);
  return loaded.exports;
}

const article = {
  id: 'published-article', slug: 'noticia-prueba', title: 'Noticia de prueba', category: 'Noticias',
  summary: 'Resumen de prueba', content: 'Contenido de prueba', is_published: true,
  published_at: '2026-10-14T12:00:00Z', updated_at: '2026-10-14T12:00:00Z', views_count: 1,
};
let featuredFallback = false;
const requests = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  requests.push({ input, init });
  const rows = featuredFallback && new URL(input).searchParams.get('category') === 'eq.Destacadas' ? [] : [article];
  return new Response(init.method === 'HEAD' ? null : JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json', 'Content-Range': `0-0/${rows.length}` },
  });
};

function assertRead(request, tags) {
  assert.ok(['GET', 'HEAD'].includes(request.init.method));
  assert.equal(request.init.cache, 'force-cache');
  assert.deepEqual(request.init.next, { revalidate: 300, tags });
  assert.equal(request.init.headers.get('Authorization'), 'Bearer public-test-key');
  assert.equal(request.init.headers.get('Cookie'), null);
}

try {
  // Ejecuta el cliente y los lectores reales; solo sustituye la respuesta HTTP, sin red ni cookies.
  const publicClient = loadTs('src/lib/supabase/public.ts');
  aliases['@/lib/supabase/public'] = publicClient;
  const { createClient } = publicClient;
  const client = createClient();
  const result = await client.from('articles').select('id').eq('is_published', true);
  assert.equal(result.error, null);
  await client.from('articles').select('id', { head: true, count: 'exact' });
  await client.rpc('increment_views', { article_id: 'published-article' });
  assert.deepEqual(requests.map(({ init }) => init.method), ['GET', 'HEAD', 'POST']);
  requests.slice(0, 2).forEach(request => assertRead(request, []));
  assert.equal(requests[2].init.cache, 'no-store');
  assert.equal(requests[2].init.next, undefined);

  requests.length = 0;
  const taggedClient = createClient(['articles:list']);
  await taggedClient.from('articles').select('id');
  await taggedClient.from('articles').select('id', { head: true, count: 'exact' });
  await taggedClient.rpc('increment_views', { article_id: article.id });
  requests.slice(0, 2).forEach(request => assertRead(request, ['articles:list']));
  assert.equal(requests[2].init.cache, 'no-store');
  assert.equal(requests[2].init.next, undefined);

  const api = loadTs('src/lib/api.ts');
  const news = loadTs('src/app/noticia/[slug]/page.tsx');
  const params = { params: Promise.resolve({ slug: article.slug }) };
  const readers = [
    ['destacadas', () => api.getFeaturedArticles(), [['articles:list']]],
    ['categoría', () => api.getArticlesByCategory('Noticias'), [['articles:list']]],
    ['categoría paginada', () => api.getArticlesByCategoryPaginated('Noticias'), [['articles:list']]],
    ['todos paginados', () => api.getAllArticlesPaginated(), [['articles:list']]],
    ['últimas', () => api.getLatestArticles(), [['articles:list']]],
    ['búsqueda API', () => api.searchArticles('noticia'), [['articles:list']]],
    ['artículo API', () => api.getArticleBySlug(article.slug), [[`article:${article.slug}`]]],
    ['relacionados API', () => api.getRelatedArticles('Noticias', article.id), [[]]],
    ['ticker', () => api.getRecentArticlesForTicker(), [[]]],
    ['reels', () => api.getReels(), [['reels:list']]],
    ['reels paginados', () => api.getReelsPaginated(), [['reels:list']]],
    ['reel por ID', () => api.getReelById(article.id), [['reels:list']]],
    ['metadatos noticia', () => news.generateMetadata(params), [[`article:${article.slug}`]]],
    ['noticia y relacionados', () => news.default(params), [[`article:${article.slug}`], []]],
    ['página búsqueda', () => loadTs('src/app/buscar/page.tsx').default({ searchParams: Promise.resolve({ q: 'noticia' }) }), [['articles:list']]],
    ['página categoría', () => loadTs('src/app/categoria/[slug]/page.tsx').default({
      params: Promise.resolve({ slug: 'noticias' }), searchParams: Promise.resolve({ page: '1' }),
    }), [['articles:list'], ['articles:list']]],
    ['página reels', () => loadTs('src/app/reels/page.tsx').default(), [['reels:list']]],
    ['RSS', () => loadTs('src/app/feed.xml/route.ts').GET(), [['articles:list']]],
    ['sitemap', () => loadTs('src/app/sitemap.ts').default(), [['articles:list']]],
  ];
  for (const [label, reader, expectedTags] of readers) {
    requests.length = 0;
    await reader();
    assert.deepEqual(requests.map(({ init }) => init.next?.tags), expectedTags, label);
    requests.forEach((request, index) => assertRead(request, expectedTags[index]));
  }
  featuredFallback = true;
  requests.length = 0;
  await api.getFeaturedArticles();
  assert.equal(requests.length, 2);
  requests.forEach(request => assertRead(request, ['articles:list']));

  const longTags = [];
  for (const slug of ['a'.repeat(249), 'a'.repeat(1000), `${'a'.repeat(999)}b`]) {
    const tag = `article:hash:${createHash('sha256').update(slug).digest('hex')}`;
    longTags.push(tag);
    assert.ok(tag.length <= 256);
    for (const reader of [
      () => api.getArticleBySlug(slug),
      () => news.generateMetadata({ params: Promise.resolve({ slug }) }),
    ]) {
      requests.length = 0;
      await reader();
      assert.equal(requests.length, 1);
      assertRead(requests[0], [tag]);
      assert.equal(new URL(requests[0].input).searchParams.get('slug'), `eq.${slug}`);
    }
  }
  assert.equal(new Set(longTags).size, longTags.length);
} finally {
  globalThis.fetch = originalFetch;
}

const middlewareSource = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const configMatch = middlewareSource.match(/matcher:\s*(\[[^\]]+\])/);
assert.ok(configMatch);
const config = { matcher: JSON.parse(configMatch[1].replaceAll("'", '"')) };
for (const url of ['/admin', '/admin/login', '/admin/articulos/nuevo', '/api/admin/users']) {
  assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, url);
}
for (const url of ['/', '/noticia/test', '/categoria/noticias?page=2', '/buscar?q=nota', '/reels', '/sitemap.xml', '/api/articles', '/favicon.png']) {
  assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, url);
}
process.stdout.write('PASS: 19 lectores reales con etiquetas acotadas, slugs largos con hash estable, GET/HEAD anónimos por 300s, POST sin caché y middleware privado.\n');
