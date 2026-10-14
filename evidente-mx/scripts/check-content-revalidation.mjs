import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function loadTs(relativePath, aliases) {
  const filename = path.join(root, relativePath);
  const loaded = new Module(filename);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => aliases[name] || originalRequire(name);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  loaded._compile(outputText, filename);
  return loaded.exports;
}

// Ejecuta la acción y requireRole reales; solo simula sesión/caché de Next fuera de una request.
let role = null;
let cacheFailure = false;
const tags = [];
const server = {
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: role ? { id: 'user-id' } : null } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role } }) }) }) }),
  }),
};
const navigation = { redirect: target => { throw new Error(`redirect:${target}`); } };
const auth = loadTs('src/lib/auth.ts', {
  '@/lib/supabase/server': server,
  'next/navigation': navigation,
});
const contentCache = loadTs('src/lib/content-cache.ts', {
  '@/lib/content-tags': loadTs('src/lib/content-tags.ts', {}),
  'next/cache': {
    revalidateTag: tag => {
      if (cacheFailure) throw new Error('Temporary cache failure');
      tags.push(tag);
    },
  },
});
const { refreshPublicContent } = loadTs('src/app/admin/actions.ts', {
  '@/lib/supabase/server': server,
  '@/lib/auth': auth,
  '@/lib/content-cache': contentCache,
  'next/navigation': navigation,
});

await assert.rejects(refreshPublicContent('articles', ['article-before']), /redirect:\/admin\/login/);
await assert.rejects(refreshPublicContent('invalid', null), /redirect:\/admin\/login/);
assert.deepEqual(tags, []);
role = 'viewer';
await assert.rejects(refreshPublicContent('reels'), /redirect:\/admin$/);
assert.deepEqual(tags, []);
for (const allowedRole of ['admin', 'editor', 'publisher']) {
  role = allowedRole;
  tags.length = 0;
  await refreshPublicContent('articles', ['article-before', 'article-after', 'article-before']);
  assert.deepEqual(tags, ['articles:list', 'article:article-before', 'article:article-after']);
}
tags.length = 0;
await refreshPublicContent('articles');
await refreshPublicContent('articles', []);
assert.deepEqual(tags, []);
await refreshPublicContent('articles', ['draft-published']);
assert.deepEqual(tags, ['articles:list', 'article:draft-published']);
tags.length = 0;
await refreshPublicContent('reels');
await refreshPublicContent('reels', ['should-not-invalidate-an-article']);
assert.deepEqual(tags, ['reels:list', 'reels:list']);

tags.length = 0;
for (const [type, slugs] of [
  ['all', []], [null, []], ['articles', null], ['articles', 'single-slug'],
  ['articles', [null]], ['articles', [42]], ['articles', ['']],
  ['articles', ['valid-first', '']], ['reels', [false]],
]) {
  await assert.rejects(refreshPublicContent(type, slugs), /inválid/);
  assert.deepEqual(tags, []);
}
await refreshPublicContent('articles', ['a'.repeat(248)]);
assert.equal(tags[1].length, 256);
assert.deepEqual(tags, ['articles:list', `article:${'a'.repeat(248)}`]);

const longSlugs = ['a'.repeat(249), 'a'.repeat(1000), `${'a'.repeat(999)}b`];
const longTags = longSlugs.map(slug => `article:hash:${createHash('sha256').update(slug).digest('hex')}`);
assert.equal(new Set(longTags).size, longTags.length);
for (let attempt = 0; attempt < 2; attempt++) {
  tags.length = 0;
  await refreshPublicContent('articles', [...longSlugs, longSlugs[0]]);
  assert.deepEqual(tags, ['articles:list', ...longTags]);
  assert.ok(tags.every(tag => tag.length <= 256));
}

tags.length = 0;
cacheFailure = true;
const originalConsoleError = console.error;
const cacheWarnings = [];
console.error = (...args) => cacheWarnings.push(args);
try {
  await assert.doesNotReject(refreshPublicContent('articles', ['saved-article']));
  assert.deepEqual(tags, []);
  assert.equal(cacheWarnings.length, 1);
  assert.match(String(cacheWarnings[0][1]), /Temporary cache failure/);
} finally {
  console.error = originalConsoleError;
}
process.stdout.write('Invalidación: permisos, old/new deduplicados, borradores sin invalidar, reels aislados, slugs largos acotados, input inválido rechazado y fallo de caché tolerado.\n');

const nextServer = Module.createRequire(import.meta.url)('next/server');
const { NextRequest, NextResponse } = nextServer;
const originalEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
let middlewareUser = null;
const cookieName = 'sb-test-session';

try {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://middleware-test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-test-key';
  const { updateSession } = loadTs('src/lib/supabase/middleware.ts', {
    'next/server': nextServer,
    '@supabase/ssr': {
      createServerClient: (url, key, options) => {
        assert.equal(url, 'https://middleware-test.supabase.co');
        assert.equal(key, 'public-test-key');
        return {
          auth: {
            getUser: async () => {
              assert.deepEqual(options.cookies.getAll(), [{ name: cookieName, value: 'old-test-session' }]);
              options.cookies.setAll([{
                name: cookieName,
                value: middlewareUser ? 'renewed-test-session' : '',
                options: { path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: middlewareUser ? 3600 : 0 },
              }]);
              return { data: { user: middlewareUser } };
            },
          },
        };
      },
    },
  });

  for (const [pathname, authenticated, redirectTo] of [
    ['/admin/login', true, '/admin'],
    ['/admin', false, '/admin/login'],
    ['/admin', true, null],
  ]) {
    middlewareUser = authenticated ? { id: 'test-user' } : null;
    const request = new NextRequest(`https://example.test${pathname}`, {
      headers: { Cookie: `${cookieName}=old-test-session` },
    });
    const response = await updateSession(request);
    assert.ok(response instanceof NextResponse);
    assert.equal(response.status, redirectTo ? 307 : 200);
    assert.equal(response.headers.get('Location'), redirectTo ? `https://example.test${redirectTo}` : null);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    const cookie = response.cookies.get(cookieName);
    assert.equal(cookie?.value, authenticated ? 'renewed-test-session' : '');
    assert.equal(cookie?.path, '/');
    assert.equal(cookie?.httpOnly, true);
    assert.equal(cookie?.secure, true);
    assert.equal(cookie?.sameSite, 'lax');
    assert.equal(cookie?.maxAge, authenticated ? 3600 : 0);
    assert.equal(request.cookies.get(cookieName)?.value, cookie.value);
  }
} finally {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
process.stdout.write('Middleware: redirects y respuesta privada conservan cookies renovadas, sin red.\n');
