// Máscaras e validações do formulário de cadastro

const form = document.getElementById('form-cadastro');
const cpf = document.getElementById('cpf');
const telefone = document.getElementById('telefone');
const cep = document.getElementById('cep');
const nascimento = document.getElementById('nascimento');
const mensagem = document.getElementById('mensagem');
const contador = document.getElementById('contador');
const cepStatus = document.getElementById('cep-status');
const sucesso = document.getElementById('mensagem-sucesso');
const sucessoTexto = document.getElementById('mensagem-sucesso-texto');
const alertaErros = document.getElementById('alerta-erros');
const alertaErrosTexto = document.getElementById('alerta-erros-texto');


// ---------- mascaras ----------

function mascaraCPF(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 11);
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return valor;
}

function mascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 11);

  if (valor.length > 10) {
    // celular: (81) 99999-9999
    return valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (valor.length > 6) {
    // fixo: (81) 3333-4444
    return valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (valor.length > 2) {
    return valor.replace(/^(\d{2})(\d+)$/, '($1) $2');
  } else if (valor.length > 0) {
    return '(' + valor;
  }
  return valor;
}

function mascaraCEP(valor) {
  valor = valor.replace(/\D/g, '').slice(0, 8);
  return valor.replace(/^(\d{5})(\d)/, '$1-$2');
}


// ---------- validacao do CPF (digitos verificadores) ----------

function cpfValido(valor) {
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


// ---------- eventos ----------

cpf.addEventListener('input', function () {
  cpf.value = mascaraCPF(cpf.value);

  // so testa os digitos quando o CPF estiver completo
  if (cpf.value.length === 14 && !cpfValido(cpf.value)) {
    cpf.setCustomValidity('CPF inválido. Confira os números digitados.');
  } else {
    cpf.setCustomValidity('');
  }
});

telefone.addEventListener('input', function () {
  telefone.value = mascaraTelefone(telefone.value);
});

cep.addEventListener('input', function () {
  cep.value = mascaraCEP(cep.value);
  cepStatus.textContent = '';

  if (cep.value.length === 9) {
    buscarCEP(cep.value.replace('-', ''));
  }
});

mensagem.addEventListener('input', function () {
  contador.textContent = mensagem.value.length;
});


// voluntario precisa ter pelo menos 16 anos
const hoje = new Date();
const dataLimite = new Date(hoje.getFullYear() - 16, hoje.getMonth(), hoje.getDate());
nascimento.max = dataLimite.toISOString().split('T')[0];

nascimento.addEventListener('input', function () {
  if (nascimento.validity.rangeOverflow) {
    nascimento.setCustomValidity('É preciso ter pelo menos 16 anos para se cadastrar.');
  } else {
    nascimento.setCustomValidity('');
  }
});


// ---------- busca do endereco pelo CEP (ViaCEP) ----------

async function buscarCEP(numeroCep) {
  cepStatus.textContent = 'Buscando endereço...';

  try {
    const resposta = await fetch('https://viacep.com.br/ws/' + numeroCep + '/json/');
    const dados = await resposta.json();

    if (dados.erro) {
      cepStatus.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
      return;
    }

    document.getElementById('rua').value = dados.logradouro;
    document.getElementById('bairro').value = dados.bairro;
    document.getElementById('cidade').value = dados.localidade;
    document.getElementById('estado').value = dados.uf;
    cepStatus.textContent = '';
    document.getElementById('numero').focus();
  } catch (erro) {
    // sem internet ou API fora do ar, segue o jogo
    cepStatus.textContent = 'Não foi possível buscar o CEP. Preencha o endereço manualmente.';
  }
}


// ---------- envio ----------

// ---------- alerta de erros ----------
// antes do envio, conta os campos com problema e mostra um resumo
const botaoEnviar = form.querySelector('button[type="submit"]');

botaoEnviar.addEventListener('click', function () {
  const nomesComErro = new Set();

  Array.from(form.elements).forEach(function (campo) {
    if (campo.willValidate && !campo.validity.valid) {
      nomesComErro.add(campo.name); // radios do mesmo grupo contam uma vez so
    }
  });

  if (nomesComErro.size > 0) {
    const plural = nomesComErro.size > 1;
    alertaErrosTexto.textContent = 'Encontramos ' + nomesComErro.size +
      (plural ? ' campos que precisam' : ' campo que precisa') +
      ' de atenção. Eles estão destacados em vermelho.';
    alertaErros.hidden = false;
    sucesso.hidden = true;
  } else {
    alertaErros.hidden = true;
  }
});


// ---------- envio ----------
// o evento submit so dispara se todas as validacoes nativas passarem
form.addEventListener('submit', function (evento) {
  evento.preventDefault();

  // desativa o botao durante o "envio" para evitar clique duplo
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = 'Enviando...';

  // simula o tempo de resposta de um servidor
  setTimeout(function () {
    const primeiroNome = document.getElementById('nome').value.trim().split(' ')[0];
    sucessoTexto.textContent = 'Obrigado, ' + primeiroNome + '! Vamos entrar em contato em até uma semana.';
    sucesso.hidden = false;
    alertaErros.hidden = true;

    form.reset();
    contador.textContent = '0';
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = 'Enviar cadastro';
    sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mostrarToast('Cadastro enviado com sucesso!');
  }, 1200);
});

form.addEventListener('reset', function () {
  cepStatus.textContent = '';
  contador.textContent = '0';
});


// ---------- modal de confirmacao do "Limpar" ----------
const modalLimpar = document.getElementById('modal-limpar');

document.getElementById('botao-limpar').addEventListener('click', function () {
  modalLimpar.showModal();
});

// o <form method="dialog"> fecha o modal e guarda o value do botao clicado
modalLimpar.addEventListener('close', function () {
  if (modalLimpar.returnValue === 'confirmar') {
    form.reset();
    alertaErros.hidden = true;
    sucesso.hidden = true;
    mostrarToast('Formulário limpo.');
  }
  modalLimpar.returnValue = '';
});
