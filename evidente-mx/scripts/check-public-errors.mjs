import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let mode = 'empty';
const article = {
  id: 'article-id', title: 'Noticia de prueba válida', slug: 'noticia-de-prueba',
  summary: 'Resumen de prueba para comprobar lecturas públicas.', content: 'Contenido de prueba. '.repeat(10),
  category: 'Noticias', image_url: null, video_url: null, is_published: true, views_count: 2,
  published_at: '2026-10-13T12:00:00Z', created_at: '2026-10-13T12:00:00Z', updated_at: '2026-10-13T12:00:00Z',
};

// SDK real; respuestas HTTP simuladas sin cookies, credenciales ni conexiones externas.
const publicClient = {
  createClient: () => createClient('https://public-errors.invalid', 'test-public-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(input);
        if (mode === 'timeout') throw new TypeError('Simulated connection timeout');
        const fail = mode === '503'
          || (mode === 'related503' && url.searchParams.get('id')?.startsWith('neq.'))
          || (mode === 'categoryRows503' && init.method !== 'HEAD')
          || (mode === 'featuredFallback503' && !url.searchParams.has('category'));
        if (fail) return new Response(JSON.stringify({ code: 'XX000', message: 'Simulated database 503' }), { status: 503 });
        const rows = mode === 'empty' || mode === 'featuredFallback503' ? [] : [article];
        return new Response(init.method === 'HEAD' ? null : JSON.stringify(rows), {
          headers: { 'Content-Type': 'application/json', 'Content-Range': `0-0/${rows.length}` },
        });
      },
    },
  }),
};
const aliases = {
  '@/lib/supabase/public': publicClient,
  'next/navigation': { notFound: () => { throw new Error('NOT_FOUND'); } },
  '@/lib/sanitize': { sanitizeHtml: html => html },
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

const api = loadTs('src/lib/api.ts');
const readers = [
  () => api.getFeaturedArticles(), () => api.getArticlesByCategory('Noticias'),
  () => api.getArticlesByCategoryPaginated('Noticias'), () => api.getAllArticlesPaginated(),
  () => api.getArticleBySlug(article.slug), () => api.getRelatedArticles('Noticias', article.id),
  () => api.getRecentArticlesForTicker(), () => api.getLatestArticles(),
  () => api.getReels(), () => api.getReelsPaginated(), () => api.getReelById(article.id),
  () => api.searchArticles('noticia'),
];
for (const reader of readers) {
  for (const failure of ['503', 'timeout']) {
    mode = failure;
    await assert.rejects(reader(), /503|timeout/);
  }
  mode = 'empty';
  const empty = await reader();
  assert.ok(empty === null || (Array.isArray(empty) ? empty.length === 0 : empty.data.length === 0));
  mode = 'valid';
  const valid = await reader();
  assert.equal(Array.isArray(valid) ? valid[0].id : valid.data ? valid.data[0].id : valid.id, article.id);
}
mode = 'featuredFallback503';
await assert.rejects(api.getFeaturedArticles(), /503/);

const news = loadTs('src/app/noticia/[slug]/page.tsx');
const params = { params: Promise.resolve({ slug: article.slug }) };
const sitemap = loadTs('src/app/sitemap.ts').default;
const rss = loadTs('src/app/feed.xml/route.ts').GET;
const publicPages = [
  () => news.generateMetadata(params),
  () => loadTs('src/app/buscar/page.tsx').default({ searchParams: Promise.resolve({ q: 'noticia' }) }),
  () => loadTs('src/app/categoria/[slug]/page.tsx').default({
    params: Promise.resolve({ slug: 'noticias' }), searchParams: Promise.resolve({ page: '1' }),
  }),
  () => loadTs('src/app/reels/page.tsx').default(), sitemap, rss,
];
for (const page of publicPages) {
  for (const failure of ['503', 'timeout']) {
    mode = failure;
    await assert.rejects(page(), /503|timeout/);
  }
  mode = 'empty';
  await page();
  mode = 'valid';
  await page();
}
mode = 'empty';
assert.match((await news.generateMetadata(params)).title, /no encontrado/);
await assert.rejects(news.default(params), /NOT_FOUND/);
assert.ok(!(await (await rss()).text()).includes(article.title));
mode = 'valid';
assert.equal((await news.generateMetadata(params)).title, article.title);
assert.ok((await sitemap()).some(entry => entry.url.endsWith(article.slug)));
assert.ok((await (await rss()).text()).includes(article.title));
mode = 'related503';
await assert.rejects(news.default(params), /503/);
mode = 'categoryRows503';
await assert.rejects(publicPages[2](), /503/);
process.stdout.write('Lecturas públicas: 503/timeout propagados, ausencia real preservada y datos válidos correctos.\n');
