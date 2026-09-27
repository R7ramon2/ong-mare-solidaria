// Consulta de endereço na API pública do ViaCEP

export async function buscarEndereco(cep) {
  const numeros = cep.replace(/\D/g, '');
  const resposta = await fetch('https://viacep.com.br/ws/' + numeros + '/json/');

  if (!resposta.ok) {
    throw new Error('Falha na consulta do CEP');
  }

  const dados = await resposta.json();

  // o ViaCEP responde { erro: true } quando o CEP nao existe
  if (dados.erro) {
    return null;
  }

  return {
    rua: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    estado: dados.uf
  };
}
