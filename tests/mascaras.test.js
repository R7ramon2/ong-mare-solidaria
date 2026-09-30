import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mascaraCPF, mascaraTelefone, mascaraCEP } from '../js/modules/mascaras.js';

test('CPF: formata 11 dígitos e ignora o resto', () => {
  assert.equal(mascaraCPF('52998224725'), '529.982.247-25');
  assert.equal(mascaraCPF('529 982 247 25 abc'), '529.982.247-25');
  assert.equal(mascaraCPF('5299'), '529.9');
  assert.equal(mascaraCPF('529982247259999'), '529.982.247-25');
});

test('Telefone: celular, fixo e digitação parcial', () => {
  assert.equal(mascaraTelefone('81999990000'), '(81) 99999-0000');
  assert.equal(mascaraTelefone('8133334444'), '(81) 3333-4444');
  assert.equal(mascaraTelefone('819'), '(81) 9');
  assert.equal(mascaraTelefone('8'), '(8');
});

test('Telefone colado com +55 ou com 0 da operadora', () => {
  assert.equal(mascaraTelefone('+55 (81) 99999-0000'), '(81) 99999-0000');
  assert.equal(mascaraTelefone('081 99999-0000'), '(81) 99999-0000');
});

test('CEP: formata 8 dígitos', () => {
  assert.equal(mascaraCEP('50050000'), '50050-000');
  assert.equal(mascaraCEP('50050-000xyz'), '50050-000');
  assert.equal(mascaraCEP('500'), '500');
});
