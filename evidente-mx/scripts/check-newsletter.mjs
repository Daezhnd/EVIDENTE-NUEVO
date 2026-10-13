import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

// Ejecuta el handler y el SDK reales contra un servicio HTTP local, sin Supabase externo.
function loadTs(relativePath, aliases = {}) {
  const filename = path.resolve(scriptDirectory, '..', relativePath);
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

async function main() {
  let replies = [];
  let requests = [];
  const server = createServer((request, response) => {
    requests.push({ method: request.method, key: request.headers.apikey });
    const reply = replies.shift() || { status: 500, body: { message: 'Unexpected request' } };
    response.writeHead(reply.status, { 'Content-Type': 'application/json' });
    response.end(reply.status === 204 ? undefined : JSON.stringify(reply.body));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
  const { POST } = loadTs('src/app/api/newsletter/route.ts', {
    '@/lib/article-api': loadTs('src/lib/article-api.ts'),
  });

  async function check(email, responses, status, methods) {
    replies = [...responses];
    requests = [];
    const result = await POST(new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }));
    const body = await result.json();
    assert.equal(result.status, status);
    assert.deepEqual(requests.map(request => request.method), methods);
    assert.equal(replies.length, 0);
    assert.ok(requests.every(request => request.key === 'test-server-key'));
    if (status >= 500) {
      assert.equal(body.success, undefined);
      assert.ok(!JSON.stringify(body).includes('private database detail'));
    }
  }

  const empty = { status: 200, body: [] };
  const inactive = { status: 200, body: [{ id: 'subscriber-id', is_active: false }] };
  const failure = { status: 503, body: { code: 'XX000', message: 'private database detail' } };
  const written = { status: 204 };
  try {
    await check('invalid', [], 400, []);
    await check('reader@example.com', [empty, written], 200, ['GET', 'POST']);
    await check('reader@example.com', [failure], 500, ['GET']);
    await check('reader@example.com', [inactive, failure], 500, ['GET', 'PATCH']);
    await check('reader@example.com', [inactive, written], 200, ['GET', 'PATCH']);
    await check('reader@example.com', [empty, failure], 500, ['GET', 'POST']);
    await check('reader@example.com', [
      { status: 200, body: [{ id: 'subscriber-id', is_active: true }] },
    ], 400, ['GET']);
    process.stdout.write('Newsletter: 7 comprobaciones correctas.\n');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
