// Formulário de cadastro: máscaras, validações extras,
// busca de CEP, alertas, envio e modal de "Limpar"

import { mascaraCPF, mascaraTelefone, mascaraCEP } from './mascaras.js';
import { dataMaximaParaIdade, validarCampo, camposComRegra } from './validacao.js';
import { buscarEndereco } from './cep.js';
import { mostrarToast } from './toast.js';
import { CHAVES, salvar, carregar, remover } from './armazenamento.js';

// campos que entram no rascunho. O CPF fica de fora de proposito:
// localStorage nao e criptografado e qualquer script da pagina le,
// entao nao guardo documento pessoal nele. A autorizacao LGPD tambem
// fica de fora, porque precisa ser dada de novo a cada envio.
const CAMPOS_RASCUNHO = ['nome', 'nascimento', 'email', 'telefone', 'cep', 'rua',
  'numero', 'complemento', 'bairro', 'cidade', 'estado', 'projeto', 'turno', 'mensagem'];

const NOMES_PROJETOS = {
  reforco: 'Reforço na Maré',
  cozinha: 'Cozinha da Comunidade',
  canal: 'Canal Limpo',
  qualquer: 'Onde precisar'
};

const MAXIMO_HISTORICO = 5;

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

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
  });

  telefone.addEventListener('input', function () {
    telefone.value = mascaraTelefone(telefone.value);
  });

  mensagem.addEventListener('input', function () {
    contador.textContent = mensagem.value.length;
  });


  // limita o calendario do navegador; a regra de idade fica em validacao.js
  nascimento.max = dataMaximaParaIdade();


  // ---------- CEP ----------

  cep.addEventListener('input', async function () {
    cep.value = mascaraCEP(cep.value);
    cepStatus.textContent = '';

    if (cep.value.length !== 9) return;

    cepStatus.textContent = 'Buscando endereço...';
    const cepPedido = cep.value;

    try {
      const endereco = await buscarEndereco(cepPedido);

      // se o CEP foi alterado enquanto a resposta chegava, ignora a antiga
      if (cep.value !== cepPedido) return;

      if (!endereco) {
        cepStatus.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
        return;
      }

      campo('rua').value = endereco.rua;
      campo('bairro').value = endereco.bairro;
      campo('cidade').value = endereco.cidade;
      campo('estado').value = endereco.estado;
      ['rua', 'bairro', 'cidade', 'estado'].forEach(checarCampo);
      cepStatus.textContent = '';
      campo('numero').focus();
    } catch (erro) {
      // sem internet ou API fora do ar: a pessoa preenche na mao
      cepStatus.textContent = 'Não foi possível buscar o CEP. Preencha o endereço manualmente.';
    }
  });


  // ---------- rascunho (localStorage) ----------

  const alertaRascunho = campo('alerta-rascunho');
  let timerRascunho = null;

  // le os campos e monta um objeto; os checkboxes de turno viram array
  function lerRascunho() {
    const dados = {};
    CAMPOS_RASCUNHO.forEach(function (nome) {
      if (nome === 'turno') {
        dados.turno = Array.from(form.querySelectorAll('input[name="turno"]:checked'))
          .map(function (caixa) { return caixa.value; });
      } else {
        dados[nome] = form.elements[nome].value;
      }
    });
    return { campos: dados, salvoEm: new Date().toISOString() };
  }

  // espera a pessoa parar de digitar por 400ms antes de gravar
  function agendarRascunho() {
    clearTimeout(timerRascunho);
    timerRascunho = setTimeout(function () {
      salvar(CHAVES.rascunho, lerRascunho());
    }, 400);
  }

  function descartarRascunho() {
    clearTimeout(timerRascunho);
    remover(CHAVES.rascunho);
    alertaRascunho.hidden = true;
  }

  // no carregamento: se existir rascunho, devolve os valores aos campos
  function restaurarRascunho() {
    const rascunho = carregar(CHAVES.rascunho, null);
    if (!rascunho || !rascunho.campos) return;

    const dados = rascunho.campos;
    CAMPOS_RASCUNHO.forEach(function (nome) {
      if (nome === 'turno') {
        form.querySelectorAll('input[name="turno"]').forEach(function (caixa) {
          caixa.checked = (dados.turno || []).includes(caixa.value);
        });
      } else if (dados[nome] !== undefined) {
        form.elements[nome].value = dados[nome];
      }
    });
    contador.textContent = mensagem.value.length;

    campo('alerta-rascunho-texto').textContent =
      'Recuperamos o que você preencheu em ' + formatarData(rascunho.salvoEm) +
      '. Por segurança, o CPF não é salvo e precisa ser digitado de novo.';
    alertaRascunho.hidden = false;
  }

  form.addEventListener('input', agendarRascunho);
  form.addEventListener('change', agendarRascunho);

  campo('descartar-rascunho').addEventListener('click', function () {
    form.reset();
    mostrarToast('Rascunho descartado.');
  });


  // ---------- histórico de envios (localStorage) ----------

  const secaoHistorico = campo('historico');
  const listaHistorico = campo('lista-historico');

  // monta a lista na tela a partir do array salvo
  function mostrarHistorico() {
    const historico = carregar(CHAVES.historico, []);
    listaHistorico.replaceChildren();

    historico.forEach(function (item) {
      const li = document.createElement('li');
      li.className = 'historico__item';

      const descricao = document.createElement('span');
      // textContent (e nao innerHTML): o nome veio do usuario e nao pode virar HTML
      descricao.textContent = item.nome + ' - ' + item.projeto;

      const data = document.createElement('time');
      data.className = 'historico__data';
      data.dateTime = item.data;
      data.textContent = formatarData(item.data);

      li.append(descricao, data);
      listaHistorico.appendChild(li);
    });

    secaoHistorico.hidden = historico.length === 0;
  }

  function registrarNoHistorico(nome, projeto) {
    const historico = carregar(CHAVES.historico, []);
    historico.unshift({ nome: nome, projeto: NOMES_PROJETOS[projeto], data: new Date().toISOString() });
    salvar(CHAVES.historico, historico.slice(0, MAXIMO_HISTORICO));
    mostrarHistorico();
  }

  campo('apagar-historico').addEventListener('click', function () {
    remover(CHAVES.historico);
    mostrarHistorico();
    mostrarToast('Histórico apagado.');
  });


  // ---------- verificação dos campos ----------

  // a validacao nativa do navegador fica desligada so quando o JS
  // carrega; sem JS, os atributos required e pattern continuam valendo
  form.noValidate = true;

  // mostra ou remove o erro de um campo, mexendo nas classes e no HTML
  function marcarCampo(nome, mensagem) {
    const elemento = form.elements[nome];
    const primeiro = elemento instanceof RadioNodeList ? elemento[0] : elemento;
    const caixa = primeiro.closest('.campo');
    const idMensagem = 'erro-' + nome;

    // remove a mensagem anterior, se existir
    const antiga = document.getElementById(idMensagem);
    if (antiga) antiga.remove();

    if (mensagem) {
      caixa.classList.add('campo--erro');
      caixa.classList.remove('campo--sucesso');

      const aviso = document.createElement('p');
      aviso.className = 'msg-erro';
      aviso.id = idMensagem;
      aviso.textContent = mensagem;
      caixa.appendChild(aviso);

      primeiro.setAttribute('aria-invalid', 'true');
      primeiro.setAttribute('aria-describedby', idMensagem);
    } else {
      caixa.classList.remove('campo--erro');
      caixa.classList.add('campo--sucesso');
      primeiro.removeAttribute('aria-invalid');
      primeiro.removeAttribute('aria-describedby');
    }
  }

  function checarCampo(nome) {
    const mensagem = validarCampo(form, nome);
    marcarCampo(nome, mensagem);
    return mensagem === '';
  }

  // Tempo real sem incomodar: o campo so e avaliado depois que a pessoa
  // sai dele (blur). A partir dai, e reavaliado a cada tecla (input),
  // para o erro sumir assim que for corrigido.
  const tocados = new Set();

  form.addEventListener('focusout', function (evento) {
    const nome = evento.target.name;
    if (!camposComRegra().includes(nome)) return;
    tocados.add(nome);
    checarCampo(nome);
  });

  form.addEventListener('input', function (evento) {
    const nome = evento.target.name;
    if (tocados.has(nome)) checarCampo(nome);
  });

  // radio e checkbox mudam com clique, entao valem na hora
  form.addEventListener('change', function (evento) {
    const nome = evento.target.name;
    if (nome === 'projeto' || nome === 'termos') {
      tocados.add(nome);
      checarCampo(nome);
    }
  });


  // ---------- envio ----------

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    // confere todos os campos de uma vez
    const invalidos = camposComRegra().filter(function (nome) {
      tocados.add(nome);
      return !checarCampo(nome);
    });

    if (invalidos.length > 0) {
      const plural = invalidos.length > 1;
      alertaErrosTexto.textContent = 'Encontramos ' + invalidos.length +
        (plural ? ' campos que precisam' : ' campo que precisa') +
        ' de atenção. Confira as mensagens em vermelho.';
      alertaErros.hidden = false;
      sucesso.hidden = true;

      // leva o foco para o primeiro campo com erro
      const primeiro = form.elements[invalidos[0]];
      (primeiro instanceof RadioNodeList ? primeiro[0] : primeiro).focus();
      return;
    }

    alertaErros.hidden = true;

    // desativa o botao durante o "envio" para evitar clique duplo
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';

    // simula o tempo de resposta de um servidor
    setTimeout(function () {
      const primeiroNome = campo('nome').value.trim().split(' ')[0];
      registrarNoHistorico(primeiroNome, form.elements.projeto.value);
      sucessoTexto.textContent = 'Obrigado, ' + primeiroNome + '! Vamos entrar em contato em até uma semana.';
      sucesso.hidden = false;

      form.reset();
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = 'Enviar cadastro';
      sucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mostrarToast('Cadastro enviado com sucesso!');
    }, 1200);
  });

  // ao limpar, tira todas as marcas de erro e sucesso
  form.addEventListener('reset', function () {
    descartarRascunho();
    cepStatus.textContent = '';
    contador.textContent = '0';
    tocados.clear();
    form.querySelectorAll('.msg-erro').forEach(function (msg) { msg.remove(); });
    form.querySelectorAll('.campo--erro, .campo--sucesso').forEach(function (caixa) {
      caixa.classList.remove('campo--erro', 'campo--sucesso');
    });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
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

  // ---------- estado inicial vindo do localStorage ----------
  restaurarRascunho();
  mostrarHistorico();
}
