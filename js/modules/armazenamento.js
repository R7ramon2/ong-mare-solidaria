// Funções para gravar e ler do localStorage.
// O localStorage só guarda texto, então todo objeto ou array passa
// pelo JSON.stringify na gravação e pelo JSON.parse na leitura.
// O try/catch protege contra navegador com armazenamento bloqueado
// (modo privado em alguns navegadores) ou dado corrompido.

const PREFIXO = 'mare:';

export const CHAVES = {
  preferencias: PREFIXO + 'preferencias',
  rascunho: PREFIXO + 'rascunho-cadastro',
  historico: PREFIXO + 'historico-cadastros'
};

export function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}

// devolve o valor já convertido de volta para objeto/array,
// ou o valor padrão se não existir nada salvo
export function carregar(chave, padrao) {
  try {
    const texto = localStorage.getItem(chave);
    return texto === null ? padrao : JSON.parse(texto);
  } catch (erro) {
    return padrao;
  }
}

export function remover(chave) {
  try {
    localStorage.removeItem(chave);
  } catch (erro) {
    // sem armazenamento disponível, não há o que remover
  }
}
