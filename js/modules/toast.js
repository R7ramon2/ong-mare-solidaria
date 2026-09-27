// Toast: notificação que aparece no canto e some sozinha.
// Uso: mostrarToast('Mensagem') ou mostrarToast('Mensagem', 'erro')

const TEMPO_NA_TELA = 5000;

function pegarArea() {
  let area = document.querySelector('.toast-area');

  // cria a área na primeira vez; o aria-live faz o leitor de tela ler o aviso
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    document.body.appendChild(area);
  }
  return area;
}

export function mostrarToast(mensagem, tipo) {
  const toast = document.createElement('div');
  toast.className = 'toast' + (tipo ? ' toast--' + tipo : '');

  const texto = document.createElement('p');
  texto.className = 'toast__texto';
  texto.textContent = mensagem;

  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'toast__fechar';
  fechar.setAttribute('aria-label', 'Fechar aviso');
  fechar.textContent = '×';

  toast.append(texto, fechar);
  pegarArea().appendChild(toast);

  function remover() {
    toast.classList.add('toast--saindo');
    setTimeout(function () { toast.remove(); }, 300);
  }

  fechar.addEventListener('click', remover);
  setTimeout(remover, TEMPO_NA_TELA);
}
