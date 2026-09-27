// Roteador da SPA
// Intercepta os cliques nos links internos, busca a página de destino,
// pega só o <main> dela e injeta no <main> atual. O cabeçalho e o
// rodapé continuam os mesmos, e a URL é atualizada com a History API.
// Como cada URL é um arquivo .html de verdade, recarregar a página ou
// abrir o link direto continua funcionando (sem erro 404).

const paginasEmCache = new Map();
let aoRenderizar = function () {};

export function iniciarRoteador(callback) {
  aoRenderizar = callback;

  // guarda o estado da página inicial para o botão "voltar" funcionar
  history.replaceState({ spa: true }, '', location.href);

  document.addEventListener('click', interceptarClique);

  // botões voltar/avançar do navegador
  window.addEventListener('popstate', function () {
    navegar(location.href, false);
  });
}

function interceptarClique(evento) {
  const link = evento.target.closest('a');
  if (!link || !deveInterceptar(link, evento)) return;

  evento.preventDefault();
  navegar(link.href, true);
}

// só intercepta links para páginas .html do próprio site
function deveInterceptar(link, evento) {
  // Ctrl/Cmd + clique ou clique do meio: deixa abrir em outra aba
  if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button !== 0) return false;
  if (link.target || link.hasAttribute('download')) return false;

  const destino = new URL(link.href);
  if (destino.origin !== location.origin) return false;   // site externo
  if (!destino.pathname.endsWith('.html')) return false;  // mailto, tel, etc.

  // âncora na mesma página (#voluntariado): o navegador resolve sozinho
  if (destino.pathname === location.pathname && destino.hash) return false;

  return true;
}

async function buscarPagina(caminho) {
  if (paginasEmCache.has(caminho)) {
    return paginasEmCache.get(caminho);
  }
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error('Página não encontrada: ' + caminho);

  const html = await resposta.text();
  paginasEmCache.set(caminho, html);
  return html;
}

async function navegar(url, adicionarAoHistorico) {
  const destino = new URL(url, location.href);
  const principal = document.querySelector('main');

  principal.setAttribute('aria-busy', 'true');
  principal.classList.add('carregando');

  try {
    const html = await buscarPagina(destino.pathname);

    // transforma o texto em um documento para poder usar querySelector nele
    const pagina = new DOMParser().parseFromString(html, 'text/html');
    const novoConteudo = pagina.querySelector('main');

    renderizar(principal, novoConteudo);
    document.title = pagina.title;
    atualizarMenu(destino.pathname);

    if (adicionarAoHistorico) {
      history.pushState({ spa: true }, '', destino.href);
    }

    posicionarTela(destino.hash);
    aoRenderizar();
  } catch (erro) {
    // se algo falhar, faz a navegação normal (recarregando a página)
    location.href = destino.href;
  } finally {
    principal.removeAttribute('aria-busy');
    principal.classList.remove('carregando');
  }
}

// limpa o <main> atual e coloca o conteúdo novo
function renderizar(principal, novoConteudo) {
  principal.className = novoConteudo.className;
  principal.replaceChildren(...novoConteudo.childNodes);
}

// marca no menu a página atual
function atualizarMenu(caminho) {
  const arquivo = caminho.split('/').pop();

  document.querySelectorAll('.menu a').forEach(function (link) {
    const linkArquivo = new URL(link.href).pathname.split('/').pop();
    const ehAtual = linkArquivo === arquivo && !new URL(link.href).hash;

    if (ehAtual) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// vai para a âncora (ex: #canal) ou para o topo, e move o foco para o
// conteúdo novo, para o leitor de tela saber que a página mudou
function posicionarTela(hash) {
  const alvo = hash ? document.querySelector(hash) : null;
  const titulo = document.querySelector('main h1');

  if (alvo) {
    alvo.scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }

  const foco = alvo || titulo;
  if (foco) {
    foco.setAttribute('tabindex', '-1');
    foco.focus({ preventScroll: true });
  }
}
