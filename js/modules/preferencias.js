// Preferências visuais salvas no localStorage: tema e tamanho do texto.
//
// Tema: "auto" segue o sistema operacional (o CSS cuida disso com
// prefers-color-scheme e prefers-contrast). As outras opções colocam
// data-tema no <html>, e o temas.css troca os tokens de cor.
//
// Tamanho do texto: como todo o CSS usa rem, mudar o font-size do
// <html> aumenta ou diminui o site inteiro de forma proporcional.

import { CHAVES, salvar, carregar } from './armazenamento.js';

const ESCALA_PADRAO = 100;
const ESCALA_MINIMA = 87.5;
const ESCALA_MAXIMA = 125;
const PASSO = 12.5;
const TEMAS = ['auto', 'claro', 'escuro', 'alto-contraste'];

let preferencias = { escalaFonte: ESCALA_PADRAO, tema: 'auto' };

// avisa quem depende das cores (o gráfico) que elas mudaram
function avisarMudancaDeTema() {
  document.dispatchEvent(new CustomEvent('mare:tema'));
}

function aplicarTema() {
  if (preferencias.tema === 'auto') {
    delete document.documentElement.dataset.tema;
  } else {
    document.documentElement.dataset.tema = preferencias.tema;
  }

  document.querySelectorAll('[data-tema]').forEach(function (botao) {
    if (botao.tagName === 'BUTTON') {
      botao.setAttribute('aria-pressed', String(botao.dataset.tema === preferencias.tema));
    }
  });
}

function aplicarFonte() {
  document.documentElement.style.fontSize = preferencias.escalaFonte + '%';

  // indica nos botões qual está ativo e trava os limites
  document.querySelectorAll('[data-fonte]').forEach(function (botao) {
    const acao = botao.dataset.fonte;
    if (acao === 'padrao') {
      botao.setAttribute('aria-pressed', String(preferencias.escalaFonte === ESCALA_PADRAO));
    }
    if (acao === 'diminuir') botao.disabled = preferencias.escalaFonte <= ESCALA_MINIMA;
    if (acao === 'aumentar') botao.disabled = preferencias.escalaFonte >= ESCALA_MAXIMA;
  });
}

export function iniciarPreferencias() {
  // restaura o que foi salvo na última visita (versões antigas não têm "tema")
  preferencias = Object.assign({ escalaFonte: ESCALA_PADRAO, tema: 'auto' },
    carregar(CHAVES.preferencias, {}));
  if (!TEMAS.includes(preferencias.tema)) preferencias.tema = 'auto';

  aplicarTema();
  aplicarFonte();

  document.querySelectorAll('button[data-tema]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      preferencias.tema = botao.dataset.tema;
      salvar(CHAVES.preferencias, preferencias);
      aplicarTema();
      avisarMudancaDeTema();
    });
  });

  document.querySelectorAll('[data-fonte]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      const acao = botao.dataset.fonte;

      if (acao === 'aumentar') {
        preferencias.escalaFonte = Math.min(ESCALA_MAXIMA, preferencias.escalaFonte + PASSO);
      } else if (acao === 'diminuir') {
        preferencias.escalaFonte = Math.max(ESCALA_MINIMA, preferencias.escalaFonte - PASSO);
      } else {
        preferencias.escalaFonte = ESCALA_PADRAO;
      }

      salvar(CHAVES.preferencias, preferencias);
      aplicarFonte();
    });
  });

  // no modo automático, se o sistema mudar de claro para escuro
  // (ex: modo noturno programado), o gráfico acompanha
  ['(prefers-color-scheme: dark)', '(prefers-contrast: more)'].forEach(function (consulta) {
    window.matchMedia(consulta).addEventListener('change', function () {
      if (preferencias.tema === 'auto') avisarMudancaDeTema();
    });
  });
}
