import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
const source = await readFile(new URL('../src/lib/supabase/public.ts', import.meta.url), 'utf8');
const envModule = `data:text/javascript,${encodeURIComponent("export const env = {supabase:{url:'https://example.supabase.co',anonKey:'public-test-key'}};")}`;
const sdkModule = import.meta.resolve('@supabase/supabase-js');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace("'@/lib/env'", JSON.stringify(envModule)).replace("'@supabase/supabase-js'", JSON.stringify(sdkModule));

const requests = [];
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  requests.push({ input, init });
  return new Response(init.method === 'HEAD' ? null : JSON.stringify([{ id: 'published-article' }]), {
    headers: { 'Content-Type': 'application/json', 'Content-Range': '0-0/1' },
  });
};

try {
  const { createClient } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  const client = createClient();
  const result = await client.from('articles').select('id').eq('is_published', true);
  assert.equal(result.error, null);
  await client.from('articles').select('id', { head: true, count: 'exact' });
  await client.rpc('increment_views', { article_id: 'published-article' });
  assert.deepEqual(requests.map(({ init }) => init.method), ['GET', 'HEAD', 'POST']);
  for (const { init } of requests.slice(0, 2)) {
    assert.equal(init.cache, 'force-cache');
    assert.deepEqual(init.next, { revalidate: 300, tags: ['public-content'] });
    assert.equal(init.headers.get('Authorization'), 'Bearer public-test-key');
    assert.equal(init.headers.get('Cookie'), null);
  }
  assert.equal(requests[2].init.cache, 'no-store');
  assert.equal(requests[2].init.next, undefined);
} finally {
  globalThis.fetch = originalFetch;
}

const middlewareSource = await readFile(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const configMatch = middlewareSource.match(/matcher:\s*(\[[^\]]+\])/);
assert.ok(configMatch);
const config = { matcher: JSON.parse(configMatch[1].replaceAll("'", '"')) };
for (const url of ['/admin', '/admin/login', '/admin/articulos/nuevo', '/api/admin/users']) {
  assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, url);
}
for (const url of ['/', '/noticia/test', '/categoria/noticias?page=2', '/buscar?q=nota', '/reels', '/sitemap.xml', '/api/articles', '/favicon.png']) {
  assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, url);
}
process.stdout.write('PASS: anonymous GET/HEAD caching, uncached RPC writes, auth middleware restricted to admin\n');
