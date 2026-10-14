import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = Module.createRequire(import.meta.url);
const purifierRequire = Module.createRequire(require.resolve('isomorphic-dompurify'));
const { JSDOM } = purifierRequire('jsdom');
const createDOMPurify = purifierRequire('dompurify');
const browser = new JSDOM('');
function loadSanitizer(purifier) {
  const filename = path.join(root, 'src/lib/sanitize.ts');
  const loaded = new Module(filename);
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = name => name === 'isomorphic-dompurify' && purifier
    ? { default: purifier } : originalRequire(name);
  loaded._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  return loaded.exports.sanitizeHtml;
}

// El módulo real usa DOMPurify tanto con su DOM de servidor como con un DOM de navegador.
const serverSanitize = loadSanitizer();
const browserSanitize = loadSanitizer(createDOMPurify(browser.window));
const attacks = [
  '<img src=x onerror=alert(1)>',
  '<p onclick="alert(1)">Texto</p><script>alert(1)</script>',
  '<a href="java&#x73;cript:alert(1)">Enlace</a>',
  '<a href="jav&#x09;ascript:alert(1)">Enlace</a>',
  '<a href="data:text/html,<script>alert(1)</script>">Enlace</a>',
  '<svg onload=alert(1)><foreignObject><img src=x onerror=alert(2)></foreignObject></svg>',
  '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=alert(1)>">',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe><object data="javascript:alert(1)"></object>',
];

try {
  for (const dirty of attacks) {
    const serverClean = serverSanitize(dirty);
    assert.equal(serverClean, browserSanitize(dirty));
    const fragment = JSDOM.fragment(serverClean);
    assert.equal(fragment.querySelector('script, iframe, object, embed, svg, math, form'), null);
    for (const element of fragment.querySelectorAll('*')) {
      for (const attribute of element.attributes) {
        assert.ok(!/^on/i.test(attribute.name));
        if (attribute.name === 'href') {
          assert.ok(!/^(?:javascript|data|vbscript):/i.test(attribute.value.replace(/\s/g, '')));
        }
      }
    }
  }
  const safe = '<h2>Noticia</h2><p class="mb-6" style="text-align: center">Hola <strong>México</strong></p>'
    + '<a href="/noticia/otra">Otra</a><a href="https://evidente.mx">Web</a>'
    + '<img src="https://example.com/foto.jpg" alt="Foto"><table><tbody><tr><td>Dato</td></tr></tbody></table>';
  assert.equal(serverSanitize(safe), safe);
  assert.equal(browserSanitize(safe), safe);
  assert.equal(serverSanitize(''), '');
  process.stdout.write('HTML: 8 ataques bloqueados en servidor y navegador; formato, estilos y enlaces válidos conservados.\n');
} finally {
  browser.window.close();
}
