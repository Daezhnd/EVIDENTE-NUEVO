import assert from 'node:assert/strict';
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
const { refreshPublicContent } = loadTs('src/app/admin/actions.ts', {
  '@/lib/supabase/server': server,
  '@/lib/auth': auth,
  'next/navigation': navigation,
  'next/cache': {
    revalidateTag: tag => {
      if (cacheFailure) throw new Error('Temporary cache failure');
      tags.push(tag);
    },
  },
});

await assert.rejects(refreshPublicContent(), /redirect:\/admin\/login/);
assert.deepEqual(tags, []);
role = 'viewer';
await assert.rejects(refreshPublicContent(), /redirect:\/admin$/);
assert.deepEqual(tags, []);
for (const allowedRole of ['admin', 'editor', 'publisher']) {
  role = allowedRole;
  await refreshPublicContent();
}
assert.deepEqual(tags, ['public-content', 'public-content', 'public-content']);
cacheFailure = true;
await assert.doesNotReject(refreshPublicContent());
assert.equal(tags.length, 3);
process.stdout.write('Invalidación: anónimo/viewer denegados, 3 roles autorizados y fallo de caché tolerado.\n');

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
