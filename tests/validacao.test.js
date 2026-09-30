import { test } from 'node:test';
import assert from 'node:assert/strict';

// o validacao.js usa RadioNodeList, que só existe no navegador
globalThis.RadioNodeList = class RadioNodeList {};

const { cpfValido, validarCampo, dataMaximaParaIdade } = await import('../js/modules/validacao.js');

// formulário falso: validarCampo só precisa de form.elements[nome]
const formCom = (campos) => ({ elements: campos });

test('cpfValido confere os dígitos verificadores', () => {
  assert.equal(cpfValido('529.982.247-25'), true);
  assert.equal(cpfValido('529.982.247-26'), false);
  assert.equal(cpfValido('111.111.111-11'), false);
  assert.equal(cpfValido('123'), false);
});

test('nome exige nome e sobrenome com letras', () => {
  const erro = (valor) => validarCampo(formCom({ nome: { value: valor } }), 'nome');
  assert.equal(erro('Maria da Silva'), '');
  assert.equal(erro('José Araújo'), '');
  assert.match(erro(''), /Informe/);
  assert.match(erro('Maria'), /sobrenome/);
  assert.match(erro('Maria 123'), /letras/);
});

test('e-mail, telefone e CEP seguem o formato esperado', () => {
  const erro = (nome, valor) => validarCampo(formCom({ [nome]: { value: valor } }), nome);
  assert.equal(erro('email', 'nome@exemplo.com'), '');
  assert.notEqual(erro('email', 'nome@exemplo'), '');
  assert.equal(erro('telefone', '(81) 99999-0000'), '');
  assert.equal(erro('telefone', '(81) 3333-4444'), '');
  assert.notEqual(erro('telefone', '(81) 9999'), '');
  assert.equal(erro('cep', '50050-000'), '');
  assert.notEqual(erro('cep', '50050'), '');
});

test('número aceita 120, 120A e S/N', () => {
  const erro = (valor) => validarCampo(formCom({ numero: { value: valor } }), 'numero');
  assert.equal(erro('120'), '');
  assert.equal(erro('120A'), '');
  assert.equal(erro('s/n'), '');
  assert.notEqual(erro('abc'), '');
});

test('idade mínima de 16 anos', () => {
  const erro = (valor) => validarCampo(formCom({ nascimento: { value: valor } }), 'nascimento');
  assert.equal(erro('1995-05-10'), '');
  assert.equal(erro(dataMaximaParaIdade()), '');
  const ontem = new Date();
  ontem.setFullYear(ontem.getFullYear() - 10);
  assert.match(erro(ontem.toISOString().split('T')[0]), /16 anos/);
});

test('autorização LGPD precisa estar marcada', () => {
  const erro = (marcado) => validarCampo(formCom({ termos: { type: 'checkbox', checked: marcado } }), 'termos');
  assert.equal(erro(true), '');
  assert.notEqual(erro(false), '');
});
