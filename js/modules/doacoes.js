// Página de projetos: botão que copia a chave Pix

import { mostrarToast } from './toast.js';

export function iniciarDoacoes() {
  const botao = document.getElementById('copiar-pix');
  if (!botao) return;

  botao.addEventListener('click', function () {
    const chave = botao.dataset.chave;

    navigator.clipboard.writeText(chave)
      .then(function () {
        mostrarToast('Chave Pix copiada! Agora é só colar no app do seu banco.');
      })
      .catch(function () {
        mostrarToast('Não foi possível copiar. Copie a chave manualmente.', 'erro');
      });
  });
}
