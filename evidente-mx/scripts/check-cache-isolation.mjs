import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFile, mkdir, mkdtemp, readFile, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.dirname(app);
const require = createRequire(import.meta.url);
const next = require.resolve('next/dist/bin/next');
const backendOrigin = 'http://127.0.0.1:3316';
const origin = 'http://127.0.0.1:3317';
const articles = ['a', 'b', 'draft'].map((slug, index) => ({
  id: slug, slug, title: `${slug.toUpperCase()} title`, content: `${slug.toUpperCase()} original body`,
  category: 'Noticias', is_published: slug !== 'draft', published_at: `2026-10-${14 - index}T00:00:00Z`,
}));
const reels = [{ id: 'r', caption: 'Reel original', is_published: true }];
const children = [];
let fixture;
let logs = '';
const backend = createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  const url = new URL(request.url, backendOrigin);
  const table = url.pathname.split('/').at(-1);
  if (!['articles', 'reels'].includes(table)) { response.writeHead(404).end(); return; }
  let rows = (table === 'articles' ? articles : reels).filter(row => {
    for (const [key, value] of url.searchParams) {
      if (value.startsWith('eq.') && String(row[key]) !== value.slice(3)) return false;
      if (value.startsWith('neq.') && String(row[key]) === value.slice(4)) return false;
    }
    return true;
  });
  const total = rows.length;
  if (url.searchParams.has('order')) rows = [...rows].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const offset = Number(url.searchParams.get('offset') || 0);
  rows = rows.slice(offset, offset + Number(url.searchParams.get('limit') || rows.length));
  const select = url.searchParams.get('select');
  if (select && select !== '*') rows = rows.map(row => Object.fromEntries(select.split(',').map(key => [key.trim(), row[key.trim()]])));
  response.writeHead(200, { 'Content-Type': 'application/json', 'Content-Range': `0-${Math.max(0, rows.length - 1)}/${total}` });
  response.end(request.method === 'HEAD' ? undefined : JSON.stringify(rows));
});
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function put(relative, content) {
  const filename = path.join(fixture, relative);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, content);
}
function launch(command) {
  // No .env files or application secrets are inherited by the isolated project.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => /^(path|systemroot|systemdrive|temp|tmp|comspec|pathext|windir|userprofile|appdata|localappdata|processor_architecture|number_of_processors)$/i.test(key)));
  const child = spawn(process.execPath, ['--no-experimental-require-module', next, ...command], {
    cwd: fixture, env: { ...env, NEXT_TELEMETRY_DISABLED: '1' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  child.stdout.on('data', chunk => { logs += chunk; });
  child.stderr.on('data', chunk => { logs += chunk; });
  return child;
}
async function page(pathname, expected, status = 200) {
  let latest;
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await fetch(origin + pathname);
    latest = { status: response.status, html: await response.text(), cache: response.headers.get('x-nextjs-cache') };
    if (latest.status === status && (!expected || latest.html.includes(expected))) return latest;
    await pause(100);
  }
  assert.equal(latest.status, status, pathname);
  assert.ok(latest.html.includes(expected), `${pathname}: contenido sin renovar`);
}
async function hit(pathname, expected) {
  await page(pathname, expected);
  assert.equal((await page(pathname, expected)).cache, 'HIT', `${pathname}: perdió la caché`);
}
async function retained(pathname, expected) {
  const response = await fetch(origin + pathname);
  assert.equal(response.status, 200, pathname);
  assert.ok((await response.text()).includes(expected), pathname);
  assert.equal(response.headers.get('x-nextjs-cache'), 'HIT', `${pathname}: la primera lectura perdió la caché`);
}
async function invalidate(type, slugs = []) {
  const response = await fetch(`${origin}/api/invalidate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, slugs }),
  });
  assert.equal(response.status, 200, 'Invalidación del fixture');
}

try {
  await new Promise((resolve, reject) => { backend.once('error', reject); backend.listen(3316, '127.0.0.1', resolve); });
  // Es hermano del proyecto real para no interferir con su build ni sus patrones TypeScript.
  fixture = await mkdtemp(path.join(workspace, '.cache-isolation-'));
  await symlink(path.join(app, 'node_modules'), path.join(fixture, 'node_modules'), 'junction');
  const manifest = JSON.parse(await readFile(path.join(app, 'package.json'), 'utf8'));
  await put('package.json', JSON.stringify({ private: true, dependencies: Object.fromEntries(['next', 'react', 'react-dom', '@supabase/supabase-js'].map(name => [name, manifest.dependencies[name]])) }));
  await put('next.config.mjs', 'export default { experimental: { cpus: 1 }, eslint: { ignoreDuringBuilds: true } };');
  await put('tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2017', lib: ['dom', 'esnext'], module: 'esnext', moduleResolution: 'bundler', jsx: 'preserve', esModuleInterop: true, skipLibCheck: true, paths: { '@/*': ['./src/*'] } }, include: ['src/**/*', '.next/types/**/*.ts'] }));
  for (const relative of ['lib/supabase/public.ts', 'lib/content-cache.ts', 'lib/content-tags.ts']) {
    await mkdir(path.dirname(path.join(fixture, 'src', relative)), { recursive: true });
    await copyFile(path.join(app, 'src', relative), path.join(fixture, 'src', relative));
  }
  await put('src/lib/env.ts', `export const env = { supabase: { url: '${backendOrigin}', anonKey: 'fixture-public-key' } };`);
  await put('src/app/layout.tsx', `import { createClient } from '@/lib/supabase/public';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const { data } = await createClient().from('articles').select('id,title,slug').eq('is_published', true).limit(8).throwOnError();
  return <html><body><aside>{data?.map(row => row.title).join('|')}</aside>{children}</body></html>;
}`);
  await put('src/app/page.tsx', `import { createClient } from '@/lib/supabase/public';
export const revalidate = 300;
export default async function Page() {
  const { data } = await createClient(['articles:list']).from('articles').select('*').eq('is_published', true).throwOnError();
  const { data: reels } = await createClient(['reels:list']).from('reels').select('*').eq('is_published', true).throwOnError();
  return <main>{data?.map(row => <h1 key={row.id}>{row.title}</h1>)}{reels?.map(row => <p key={row.id}>{row.caption}</p>)}</main>;
}`);
  await put('src/app/noticia/[slug]/page.tsx', `import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/public';
import { articleCacheTag } from '@/lib/content-tags';
export const revalidate = 300;
export function generateStaticParams() { return []; }
export default async function Page({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const { data: article } = await createClient([articleCacheTag(slug)]).from('articles').select('*').eq('slug', slug).eq('is_published', true).maybeSingle().throwOnError();
  if (!article) notFound();
  const { data: related } = await createClient().from('articles').select('*').eq('category', article.category).eq('is_published', true).neq('id', article.id).limit(3).throwOnError();
  return <main><h1>{article.title}</h1><p>{article.content}</p><aside>{related?.map(row => row.title).join('|')}</aside></main>;
}`);
  await put('src/app/reels/page.tsx', `import { createClient } from '@/lib/supabase/public';
export const revalidate = 300;
export default async function Page() { const { data } = await createClient(['reels:list']).from('reels').select('*').eq('is_published', true).throwOnError(); return <main>{data?.map(row => <p key={row.id}>{row.caption}</p>)}</main>; }`);
  await put('src/app/api/invalidate/route.ts', `import { invalidatePublicContent } from '@/lib/content-cache';
// Esta ruta existe exclusivamente dentro del fixture temporal, sin acceso a producción.
export async function POST(request: Request) { const { type, slugs } = await request.json(); invalidatePublicContent(type, slugs); return Response.json({ ok: true }); }`);
  const build = launch(['build']);
  const buildExit = await new Promise((resolve, reject) => { build.once('error', reject); build.once('close', resolve); });
  assert.equal(buildExit, 0, `Build del fixture:\n${logs.slice(-6000)}`);
  const server = launch(['start', '--hostname', '127.0.0.1', '--port', '3317']);
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    assert.equal(server.exitCode, null, `Next detenido:\n${logs.slice(-2000)}`);
    try { if ((await fetch(origin)).status === 200) { ready = true; break; } } catch { /* Arrancando. */ }
    await pause(100);
  }
  assert.ok(ready, 'Next no arrancó');
  await hit('/noticia/a', 'A original body');
  await hit('/noticia/b', 'B original body');
  await page('/noticia/missing', '', 404);
  await page('/noticia/missing', '', 404);
  await hit('/', 'A title');
  await hit('/reels', 'Reel original');
  articles[0].title = 'A revised title'; articles[0].content = 'A revised body';
  await invalidate('articles', ['a']);
  await page('/noticia/a', 'A revised body');
  await retained('/noticia/b', 'B original body');
  await page('/', 'A revised title');
  await retained('/reels', 'Reel original');
  articles.push({ ...articles[0], id: 'missing', slug: 'missing', title: 'Previously missing', content: 'Published after 404' });
  await invalidate('articles', ['missing']);
  await page('/noticia/missing', 'Published after 404');
  articles[0].slug = 'renamed';
  await invalidate('articles', ['a', 'renamed']);
  await page('/noticia/a', '', 404);
  await page('/noticia/renamed', 'A revised body');
  articles[0].is_published = false;
  await invalidate('articles', ['renamed']);
  await page('/noticia/renamed', '', 404);
  await invalidate('articles', []);
  await retained('/noticia/b', 'B original body');
  reels[0].caption = 'Reel revised';
  await invalidate('reels');
  await page('/reels', 'Reel revised');
  await page('/', 'Reel revised');
  await retained('/noticia/b', 'B original body');
  process.stdout.write('Caché Next producción: artículo/listados renovados; otra noticia HIT; 404/publicación/rename/unpublish y reels aislados. Sólo localhost.\n');
} finally {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await new Promise(resolve => child.once('close', resolve));
    }
  }
  await new Promise(resolve => backend.close(resolve));
  if (fixture) {
    const absolute = await realpath(fixture);
    const relative = path.relative(await realpath(workspace), absolute);
    assert.ok(relative.startsWith('.cache-isolation-') && !relative.includes(path.sep) && !path.isAbsolute(relative), 'Limpieza fuera del workspace');
    // Quitar primero el enlace impide que una limpieza recursiva alcance dependencias compartidas.
    try { await unlink(path.join(absolute, 'node_modules')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await rm(absolute, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
