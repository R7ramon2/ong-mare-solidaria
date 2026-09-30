// Gera a versão de produção do site na pasta dist/.
// O código-fonte continua legível no repositório; só a dist/ é minificada.
//
//   CSS: os 5 arquivos viram um só (estilos.min.css), na mesma ordem do HTML
//   JS:  main.js e todos os módulos viram um só arquivo (main.min.js)
//   HTML: as páginas apontam para os arquivos minificados e são minificadas
//
// Uso: npm run build

import { build, transform } from 'esbuild';
import { minify } from 'html-minifier-terser';
import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const ARQUIVOS_CSS = ['reset', 'variaveis', 'grid', 'style', 'componentes', 'temas'];
const PAGINAS = ['index', 'projetos', 'cadastro'];

async function tamanhoDaPasta(pasta, extensao) {
  let total = 0;
  for (const nome of await readdir(pasta)) {
    const caminho = join(pasta, nome);
    const info = await stat(caminho);
    if (info.isDirectory()) total += await tamanhoDaPasta(caminho, extensao);
    else if (nome.endsWith(extensao)) total += info.size;
  }
  return total;
}

const kb = (bytes) => (bytes / 1024).toFixed(1) + ' KB';

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(join(DIST, 'css'), { recursive: true });
  await mkdir(join(DIST, 'html'), { recursive: true });

  // ---------- CSS ----------
  let cssCompleto = '';
  for (const nome of ARQUIVOS_CSS) {
    cssCompleto += await readFile(join('css', nome + '.css'), 'utf8') + '\n';
  }
  const css = await transform(cssCompleto, { loader: 'css', minify: true });
  await writeFile(join(DIST, 'css', 'estilos.min.css'), css.code);

  // ---------- JS ----------
  // o import() do Chart.js usa uma URL do CDN; ela fica de fora do pacote
  await build({
    entryPoints: ['js/main.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2020',
    external: ['https://*'],
    outfile: join(DIST, 'js', 'main.min.js'),
    logLevel: 'warning'
  });

  // ---------- HTML ----------
  const linksCss = new RegExp(
    '(\\s*<link rel="stylesheet" href="\\.\\./css/(' + ARQUIVOS_CSS.join('|') + ')\\.css">)+'
  );
  for (const pagina of PAGINAS) {
    let html = await readFile(join('html', pagina + '.html'), 'utf8');
    html = html.replace(linksCss, '\n  <link rel="stylesheet" href="../css/estilos.min.css">');
    html = html.replace('src="../js/main.js"', 'src="../js/main.min.js"');
    const final = await minify(html, {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true
    });
    await writeFile(join(DIST, 'html', pagina + '.html'), final);
  }

  // ---------- arquivos copiados sem alteração ----------
  await cp('imagens', join(DIST, 'imagens'), { recursive: true });
  await cp('index.html', join(DIST, 'index.html'));

  // ---------- relatório ----------
  for (const [tipo, pastaOrigem, pastaDist] of [['CSS', 'css', 'dist/css'], ['JS', 'js', 'dist/js'], ['HTML', 'html', 'dist/html']]) {
    const extensao = '.' + tipo.toLowerCase();
    const antes = await tamanhoDaPasta(pastaOrigem, extensao);
    const depois = await tamanhoDaPasta(pastaDist, extensao);
    const reducao = Math.round((1 - depois / antes) * 100);
    console.log(`${tipo.padEnd(5)} ${kb(antes).padStart(9)} -> ${kb(depois).padStart(9)}  (-${reducao}%)`);
  }
  console.log('\nBuild pronto em dist/');
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
