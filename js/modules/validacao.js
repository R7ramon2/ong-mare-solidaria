// Regras de validação do formulário de cadastro.
// Cada campo tem uma lista de regras, testadas em ordem.
// A primeira que falhar devolve a mensagem de erro.

const IDADE_MINIMA = 16;

// ---------- expressões regulares ----------
const REGEX = {
  // nome e sobrenome, só letras (com acento), espaço, apóstrofo e hífen
  nomeCompleto: /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+(\s+[A-Za-zÀ-ÖØ-öø-ÿ'-]+)+$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  // algo@algo.dominio (sem espaços, domínio com pelo menos 2 letras)
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
  // (81) 3333-4444 ou (81) 99999-9999
  telefone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  cep: /^\d{5}-\d{3}$/,
  // 123, 123A ou S/N
  numero: /^(\d{1,5}[A-Za-z]?|S\/N)$/i
};

// ---------- funções auxiliares ----------

// confere os dois dígitos verificadores do CPF
export function cpfValido(valor) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length !== 11) return false;
  // 111.111.111-11, 222... passam na conta mas nao existem
  if (/^(\d)\1{10}$/.test(numeros)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i);
  }
  let digito1 = (soma * 10) % 11;
  if (digito1 === 10) digito1 = 0;
  if (digito1 !== Number(numeros[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i);
  }
  let digito2 = (soma * 10) % 11;
  if (digito2 === 10) digito2 = 0;

  return digito2 === Number(numeros[10]);
}

function calcularIdade(dataTexto) {
  const nascimento = new Date(dataTexto + 'T00:00:00');
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return idade;
}

// data maxima de nascimento para ter a idade minima (formato AAAA-MM-DD)
export function dataMaximaParaIdade() {
  const hoje = new Date();
  const limite = new Date(hoje.getFullYear() - IDADE_MINIMA, hoje.getMonth(), hoje.getDate());
  return limite.toISOString().split('T')[0];
}

const preenchido = function (msg) {
  return { teste: function (v) { return v.trim() !== ''; }, msg: msg };
};

// ---------- regras por campo (pelo atributo name) ----------
const REGRAS = {
  nome: [
    preenchido('Informe seu nome completo.'),
    { teste: function (v) { return REGEX.nomeCompleto.test(v.trim()); },
      msg: 'Digite nome e sobrenome, usando apenas letras.' }
  ],
  cpf: [
    preenchido('Informe seu CPF.'),
    { teste: function (v) { return REGEX.cpf.test(v); },
      msg: 'O CPF precisa ter 11 números, no formato 000.000.000-00.' },
    { teste: cpfValido,
      msg: 'Esse CPF não existe. Confira os números digitados.' }
  ],
  nascimento: [
    preenchido('Informe sua data de nascimento.'),
    { teste: function (v) { return calcularIdade(v) >= IDADE_MINIMA; },
      msg: 'É preciso ter pelo menos ' + IDADE_MINIMA + ' anos para se cadastrar.' },
    { teste: function (v) { return calcularIdade(v) <= 110; },
      msg: 'Confira o ano de nascimento.' }
  ],
  email: [
    preenchido('Informe seu e-mail.'),
    { teste: function (v) { return REGEX.email.test(v.trim()); },
      msg: 'Digite um e-mail válido, como nome@exemplo.com.' }
  ],
  telefone: [
    preenchido('Informe um telefone para contato.'),
    { teste: function (v) { return REGEX.telefone.test(v); },
      msg: 'Digite o telefone com DDD, como (81) 99999-9999.' }
  ],
  cep: [
    preenchido('Informe seu CEP.'),
    { teste: function (v) { return REGEX.cep.test(v); },
      msg: 'O CEP precisa ter 8 números, no formato 00000-000.' }
  ],
  rua: [preenchido('Informe a rua.')],
  numero: [
    preenchido('Informe o número (ou S/N).'),
    { teste: function (v) { return REGEX.numero.test(v.trim()); },
      msg: 'Use só números, como 120 ou 120A, ou S/N.' }
  ],
  bairro: [preenchido('Informe o bairro.')],
  cidade: [preenchido('Informe a cidade.')],
  estado: [preenchido('Selecione o estado.')],
  projeto: [preenchido('Escolha um projeto.')],
  termos: [
    { teste: function (v) { return v === 'aceito'; },
      msg: 'É preciso autorizar o uso dos dados para concluir o cadastro.' }
  ]
};

// devolve o valor do campo, tratando radio e checkbox
function lerValor(form, nome) {
  const elemento = form.elements[nome];
  if (elemento instanceof RadioNodeList) {
    return elemento.value; // valor do radio marcado, ou ''
  }
  if (elemento.type === 'checkbox') {
    return elemento.checked ? 'aceito' : '';
  }
  return elemento.value;
}

export function camposComRegra() {
  return Object.keys(REGRAS);
}

// devolve '' se estiver tudo certo, ou a mensagem do primeiro erro
export function validarCampo(form, nome) {
  const regras = REGRAS[nome];
  if (!regras) return '';

  const valor = lerValor(form, nome);
  for (const regra of regras) {
    if (!regra.teste(valor)) {
      return regra.msg;
    }
  }
  return '';
}
