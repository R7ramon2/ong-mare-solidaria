# Maré Solidária

[![Build e deploy](https://github.com/R7ramon2/ong-mare-solidaria/actions/workflows/deploy.yml/badge.svg)](https://github.com/R7ramon2/ong-mare-solidaria/actions/workflows/deploy.yml)

Site da **Maré Solidária**, uma ONG fictícia de Recife que organiza reforço escolar, cozinha comunitária e mutirões de limpeza. O site apresenta a ONG, mostra os projetos e as formas de doação e tem um formulário para cadastro de voluntários.

**Site publicado:** https://r7ramon2.github.io/ong-mare-solidaria/

> Projeto acadêmico, desenvolvido em quatro etapas: HTML semântico, CSS com design system, JavaScript modular (SPA) e preparação para produção.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar localmente](#como-rodar-localmente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Build e deploy](#build-e-deploy)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura do JavaScript](#arquitetura-do-javascript)
- [Acessibilidade](#acessibilidade)
- [Fluxo de trabalho com Git](#fluxo-de-trabalho-com-git)
- [Autor](#autor)

---

## Funcionalidades

- **Três páginas** (`index`, `projetos` e `cadastro`) navegáveis como **SPA**: o conteúdo troca sem recarregar a página, e as URLs continuam funcionando se forem abertas direto.
- **Formulário de cadastro** com máscaras (CPF, telefone e CEP), validação em tempo real com mensagens de erro, busca de endereço pelo CEP (ViaCEP) e modal de confirmação ao limpar.
- **Rascunho automático** do formulário e **histórico de envios** salvos no `localStorage`. Por segurança, o CPF não é salvo.
- **Gráfico de impacto** feito com Chart.js, com tabela de dados como alternativa acessível.
- **Menu responsivo** com dropdown no desktop e menu hambúrguer no celular.
- **Componentes de feedback**: alertas, badges, toast e modal.
- **Temas claro, escuro e alto contraste**, que seguem o sistema operacional ou a escolha da pessoa, e **controle de tamanho do texto** (A−, A, A+). As duas preferências ficam salvas no navegador.

## Tecnologias

| Área | Tecnologia |
|---|---|
| Estrutura | HTML5 semântico |
| Estilo | CSS3 com variáveis (design system), Grid de 12 colunas, Flexbox e metodologia BEM nos componentes |
| Comportamento | JavaScript puro (ES2020) com ES Modules, History API, Fetch API e Web Storage |
| Biblioteca | [Chart.js 4.5.1](https://www.chartjs.org/), carregada do CDN jsDelivr sob demanda |
| API externa | [ViaCEP](https://viacep.com.br/) |
| Build | [esbuild](https://esbuild.github.io/) e [html-minifier-terser](https://github.com/terser/html-minifier-terser) |
| Testes | Test runner nativo do Node.js (`node:test`) |
| Deploy | GitHub Actions e GitHub Pages |

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) **22 ou superior** (o npm já vem junto)
- Um navegador atualizado (Chrome, Edge, Firefox ou Safari)

> **Sem Node.js?** Dá para ver o site com a extensão **Live Server** do VS Code (clique com o botão direito em `index.html` e depois em *Open with Live Server*). Abrir o HTML com dois cliques **não funciona**, porque o navegador bloqueia os módulos JavaScript (`type="module"`) em arquivos locais.

## Como rodar localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/R7ramon2/ong-mare-solidaria.git
cd ong-mare-solidaria

# 2. Instalar as dependências de desenvolvimento
npm install

# 3. Subir o servidor local (abre o navegador em http://localhost:8080)
npm run dev
```

O servidor serve os arquivos-fonte sem cache, então é só salvar e recarregar a página para ver as mudanças.

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local com os arquivos-fonte em `http://localhost:8080` |
| `npm test` | Roda os testes automatizados |
| `npm run build` | Gera a versão de produção, minificada, na pasta `dist/` |
| `npm run preview` | Servidor local com a pasta `dist/` em `http://localhost:8081`, para conferir o build |

## Testes

```bash
npm test
```

Os testes ficam em `tests/` e usam o test runner nativo do Node.js, sem dependências extras. Eles cobrem os módulos que não dependem da tela:

- `mascaras.test.js`: formatação de CPF, telefone (incluindo número colado com +55) e CEP.
- `validacao.test.js`: dígitos do CPF, nome completo, e-mail, telefone, CEP, número, idade mínima e autorização LGPD.
- `cep.test.js`: busca no ViaCEP com o `fetch` simulado (CEP encontrado, inexistente e erro no servidor).

Os mesmos testes rodam automaticamente no GitHub Actions a cada Pull Request.

## Build e deploy

```bash
npm run build
```

O script `scripts/build.js` gera a pasta `dist/`:

- Junta os 6 arquivos CSS em um `estilos.min.css` minificado.
- Junta o `main.js` e os módulos em um `main.min.js` minificado.
- Atualiza os links nas páginas e minifica o HTML.
- Copia as imagens.

Resultado: o CSS ficou 32% menor, o JS 56% menor e o HTML 17% menor, e o navegador faz 2 requisições de CSS e JS em vez de 18.

O **deploy é automático**. O workflow `.github/workflows/deploy.yml` roda os testes e o build em todo Pull Request e, a cada push na `main`, publica a `dist/` no GitHub Pages. No repositório, **Settings > Pages > Source** está configurado como **GitHub Actions**.

## Estrutura de pastas

```
ong-mare-solidaria/
├── index.html            # redireciona para html/index.html (entrada do GitHub Pages)
├── html/                 # páginas: index, projetos e cadastro
├── css/
│   ├── reset.css         # zera estilos padrão do navegador
│   ├── variaveis.css     # design system: cores, tipografia, espaçamentos
│   ├── grid.css          # grid de 12 colunas e breakpoints
│   ├── style.css         # estilos das páginas
│   ├── componentes.css   # badges, alertas, toast e modal (BEM)
│   └── temas.css         # modo escuro, alto contraste e forced-colors
├── js/
│   ├── main.js           # ponto de entrada: inicia os módulos
│   └── modules/          # um arquivo por responsabilidade (ver abaixo)
├── imagens/              # logo e ilustrações em PNG
├── tests/                # testes automatizados
├── scripts/build.js      # geração da versão de produção
└── .github/              # workflow de deploy e modelo de Pull Request
```

## Arquitetura do JavaScript

O `main.js` é o único script carregado pelas páginas (`<script type="module">`). Cada módulo tem uma responsabilidade:

| Módulo | Responsabilidade |
|---|---|
| `roteador.js` | Navegação SPA: intercepta links, busca a página com `fetch`, troca o `<main>` e atualiza a URL com `pushState` |
| `formulario.js` | Eventos do cadastro, marcação de erros, rascunho, histórico e modal |
| `validacao.js` | Regras e expressões regulares de cada campo |
| `mascaras.js` | Máscaras de CPF, telefone e CEP (funções puras) |
| `cep.js` | Consulta ao ViaCEP |
| `armazenamento.js` | Único acesso ao `localStorage` (`JSON.stringify` / `JSON.parse`) |
| `preferencias.js` | Tema e tamanho do texto |
| `menu.js` | Menu hambúrguer |
| `toast.js` | Notificações |
| `doacoes.js` | Botão de copiar a chave Pix |
| `grafico.js` | Gráfico do Chart.js |

As dependências vão sempre da interface para os dados. Os módulos de dados (`validacao`, `mascaras`, `cep` e `armazenamento`) não acessam o DOM, e é isso que permite testá-los no Node.js.

## Acessibilidade

O site segue a **WCAG 2.1 nível AA**. Principais pontos:

- Link "Pular para o conteúdo" (2.4.1) e navegação completa pelo teclado, incluindo menu, dropdown e modal (2.1.1 e 2.1.2).
- Contraste mínimo de 4,5:1 conferido em todas as combinações de cor, e foco visível com contraste de 3:1 (1.4.3 e 2.4.7).
- **Modo escuro** (contraste mínimo de 6:1) e **alto contraste** (preto, branco e amarelo, mínimo de 9:1, com links sempre sublinhados e bordas em botões e cards). No modo "Automático", o site segue `prefers-color-scheme` e `prefers-contrast` do sistema, e também respeita o modo de alto contraste do Windows (`forced-colors`).
- Erros do formulário com texto, ícone e cor, ligados ao campo por `aria-describedby` e `aria-invalid` (3.3.1 e 1.4.1).
- Mensagens de status anunciadas por `role="status"` e `role="alert"` (4.1.3).
- Layout sem rolagem horizontal em telas de 320px, mesmo com o texto ampliado (1.4.10).
- Gráfico com `aria-label` e tabela de dados como alternativa (1.1.1).
- Respeito a `prefers-reduced-motion`.

**Como foi auditado:** axe-core 4.13 nas três páginas, no desktop e no celular, incluindo o formulário com erros, o menu aberto e o modal aberto, sem violações nos temas claro, escuro e alto contraste. Os critérios que ferramentas automáticas não cobrem (reflow, espaçamento de texto, ordem do foco e foco preso no modal) foram testados à mão.

### Como os temas funcionam

As cores do CSS usam **tokens semânticos** (`--cor-fundo`, `--cor-texto`, `--cor-acao`...), definidos no `variaveis.css`. O `temas.css` só redefine esses tokens:

- **Escolha salva** (botões "Tema" no rodapé): o JavaScript coloca `data-tema="claro|escuro|alto-contraste"` no `<html>`. Um script curto no `<head>` aplica a escolha antes de a página aparecer, para não piscar o tema claro.
- **Automático** (padrão): o `<html>` fica sem `data-tema` e valem as media queries do sistema. Isso funciona até sem JavaScript.

## Fluxo de trabalho com Git

- **GitFlow:** `main` (versões publicadas), `develop` (integração), `feature/*` (funcionalidades), `release/*` (preparação de versão) e `hotfix/*` (correções urgentes em produção). A `main` é protegida e só recebe mudanças por Pull Request.
- **Conventional Commits:** `feat:`, `fix:`, `perf:`, `test:`, `build:`, `ci:`, `docs:` e `chore:`, com escopo opcional, como `feat(a11y):`.
- **Versionamento semântico (SemVer):** `MAJOR.MINOR.PATCH`. As versões ficam marcadas com tags e publicadas na aba *Releases*. O histórico de mudanças está no [CHANGELOG.md](CHANGELOG.md).
- **Issues e milestones:** cada tarefa vira uma issue ligada ao milestone da versão, e os Pull Requests fecham as issues com `Closes #N`.

## Autor

**Ramon** - [github.com/R7ramon2](https://github.com/R7ramon2)
