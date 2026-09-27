// Formulário de cadastro: máscaras, validações extras,
// busca de CEP, alertas, envio e modal de "Limpar"

import { mascaraCPF, mascaraTelefone, mascaraCEP } from './mascaras.js';
import { cpfValido, dataMaximaParaIdade, camposInvalidos } from './validacao.js';
import { buscarEndereco } from './cep.js';
import { mostrarToast } from './toast.js';

const IDADE_MINIMA = 16;

export function iniciarFormulario() {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  const campo = function (id) { return document.getElementById(id); };

  const cpf = campo('cpf');
  const telefone = campo('telefone');
  const cep = campo('cep');
  const nascimento = campo('nascimento');
  const mensagem = campo('mensagem');
  const contador = campo('contador');
  const cepStatus = campo('cep-status');
  const sucesso = campo('mensagem-sucesso');
  const sucessoTexto = campo('mensagem-sucesso-texto');
  const alertaErros = campo('alerta-erros');
  const alertaErrosTexto = campo('alerta-erros-texto');
  const botaoEnviar = form.querySelector('button[type="submit"]');
  const modalLimpar = campo('modal-limpar');


  // ---------- máscaras ----------

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

  mensagem.addEventListener('input', function () {
    contador.textContent = mensagem.value.length;
  });


  // ---------- idade mínima ----------

  nascimento.max = dataMaximaParaIdade(IDADE_MINIMA);

  nascimento.addEventListener('input', function () {
    if (nascimento.validity.rangeOverflow) {
      nascimento.setCustomValidity('É preciso ter pelo menos ' + IDADE_MINIMA + ' anos para se cadastrar.');
    } else {
      nascimento.setCustomValidity('');
    }
  });


  // ---------- CEP ----------

  cep.addEventListener('input', async function () {
    cep.value = mascaraCEP(cep.value);
    cepStatus.textContent = '';

    if (cep.value.length !== 9) return;

    cepStatus.textContent = 'Buscando endereço...';

    try {
      const endereco = await buscarEndereco(cep.value);

      if (!endereco) {
        cepStatus.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
        return;
      }

      campo('rua').value = endereco.rua;
      campo('bairro').value = endereco.bairro;
      campo('cidade').value = endereco.cidade;
      campo('estado').value = endereco.estado;
      cepStatus.textContent = '';
      campo('numero').focus();
    } catch (erro) {
      // sem internet ou API fora do ar: a pessoa preenche na mao
      cepStatus.textContent = 'Não foi possível buscar o CEP. Preencha o endereço manualmente.';
    }
  });


  // ---------- alerta com resumo dos erros ----------

  botaoEnviar.addEventListener('click', function () {
    const erros = camposInvalidos(form);

    if (erros.size > 0) {
      const plural = erros.size > 1;
      alertaErrosTexto.textContent = 'Encontramos ' + erros.size +
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
      const primeiroNome = campo('nome').value.trim().split(' ')[0];
      sucessoTexto.textContent = 'Obrigado, ' + primeiroNome + '! Vamos entrar em contato em até uma semana.';
      sucesso.hidden = false;
      alertaErros.hidden = true;

      form.reset();
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


  // ---------- modal de confirmação do "Limpar" ----------

  campo('botao-limpar').addEventListener('click', function () {
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
}
