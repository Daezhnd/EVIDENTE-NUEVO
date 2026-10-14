import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
process.loadEnvFile(path.join(root, '.env.local'));
const origin = 'http://127.0.0.1:3215';
// Reproduce la carga CommonJS de Vercel, no sólo el entorno permisivo del build.
const server = spawn(process.execPath, [
  '--no-experimental-require-module', require.resolve('next/dist/bin/next'),
  'start', '--hostname', '127.0.0.1', '--port', '3215',
], { cwd: root, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = '';
server.stdout.on('data', chunk => { logs += chunk; });
server.stderr.on('data', chunk => { logs += chunk; });

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Servidor detenido: ${logs}`);
    try {
      if ((await fetch(`${origin}/contacto`)).status === 200) { ready = true; break; }
    } catch { /* El servidor todavía no escucha. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'El servidor de prueba no arrancó');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await supabase.from('articles').select('slug').eq('is_published', true).limit(2).throwOnError();
  assert.ok(data.length, 'Esta comprobación necesita al menos una noticia publicada');
  for (const pathname of ['/', ...data.map(article => `/noticia/${encodeURIComponent(article.slug)}`), '/feed.xml', '/sitemap.xml']) {
    const response = await fetch(origin + pathname);
    assert.equal(response.status, 200, pathname);
    await response.text();
  }
  const contact = await fetch(`${origin}/contacto`);
  const html = await contact.text();
  assert.ok(html.includes('mailto:contacto@evidente.mx'));
  assert.ok(html.includes('https://www.facebook.com/EVIDENTE.MX'));
  assert.ok(!html.includes('name="mensaje"') && !html.includes('¡Mensaje enviado!'));
  const missing = await fetch(`${origin}/noticia/codex-inexistente-first-five-check`);
  assert.equal(missing.status, 404);
  const admin = await fetch(`${origin}/admin/articulos/nuevo`, { redirect: 'manual' });
  assert.equal(admin.status, 307);
  assert.equal(new URL(admin.headers.get('location'), origin).pathname, '/admin/login');
  assert.ok(admin.headers.get('cache-control').includes('private'));
  process.stdout.write('Runtime CommonJS: noticias/portada/contacto/RSS/sitemap correctos, 404 real y panel privado. Sólo lecturas.\n');
} catch (error) {
  console.error(logs.slice(-2500));
  throw error;
} finally {
  server.kill();
  await new Promise(resolve => {
    if (server.exitCode !== null) resolve();
    else server.once('exit', resolve);
  });
}
