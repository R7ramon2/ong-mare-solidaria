import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buscarEndereco } from '../js/modules/cep.js';

// troca o fetch por uma versão falsa, para o teste não depender da internet
const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

const respostaFalsa = (status, corpo) => async () => ({
  ok: status >= 200 && status < 300,
  json: async () => corpo
});

test('CEP encontrado vira objeto com os nomes do projeto', async () => {
  globalThis.fetch = respostaFalsa(200, {
    logradouro: 'Rua da Aurora', bairro: 'Boa Vista', localidade: 'Recife', uf: 'PE'
  });
  assert.deepEqual(await buscarEndereco('50050-000'), {
    rua: 'Rua da Aurora', bairro: 'Boa Vista', cidade: 'Recife', estado: 'PE'
  });
});

test('CEP inexistente devolve null', async () => {
  globalThis.fetch = respostaFalsa(200, { erro: true });
  assert.equal(await buscarEndereco('99999-999'), null);
});

test('erro no servidor do ViaCEP lança exceção', async () => {
  globalThis.fetch = respostaFalsa(500, {});
  await assert.rejects(() => buscarEndereco('50050-000'));
});
