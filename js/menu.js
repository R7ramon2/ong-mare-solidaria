// Menu hambúrguer (celular)
// No desktop o botão fica escondido pelo CSS e o menu aparece normal.

const botaoMenu = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-principal');

function abrirMenu() {
  menu.classList.add('menu--aberto');
  botaoMenu.setAttribute('aria-expanded', 'true');
  botaoMenu.setAttribute('aria-label', 'Fechar menu');
}

function fecharMenu() {
  menu.classList.remove('menu--aberto');
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.setAttribute('aria-label', 'Abrir menu');
}

botaoMenu.addEventListener('click', function () {
  if (menu.classList.contains('menu--aberto')) {
    fecharMenu();
  } else {
    abrirMenu();
  }
});

// Esc fecha o menu e devolve o foco para o botão
document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape' && menu.classList.contains('menu--aberto')) {
    fecharMenu();
    botaoMenu.focus();
  }
});

// ao escolher um link (ex: projetos.html#canal) o menu fecha
menu.addEventListener('click', function (evento) {
  if (evento.target.tagName === 'A') {
    fecharMenu();
  }
});

// se a tela for aumentada com o menu aberto, volta ao estado normal
window.matchMedia('(min-width: 768px)').addEventListener('change', function (tela) {
  if (tela.matches) {
    fecharMenu();
  }
});
