// Ponto de entrada do JavaScript do site.
// Cada módulo cuida de uma parte e só age se os elementos
// dele existirem na página atual.

import { iniciarMenu } from './modules/menu.js';
import { iniciarFormulario } from './modules/formulario.js';
import { iniciarDoacoes } from './modules/doacoes.js';
import { iniciarRoteador } from './modules/roteador.js';

// avisa o CSS que o JavaScript carregou; so entao o menu do celular
// vira hamburguer. Se o JS falhar, os links continuam visiveis.
document.documentElement.classList.add('js');

// o que depende do conteudo do <main> precisa ser iniciado de novo
// toda vez que o roteador troca a pagina
function iniciarPagina() {
  iniciarFormulario();
  iniciarDoacoes();
}

iniciarMenu();
iniciarPagina();
iniciarRoteador(iniciarPagina);
