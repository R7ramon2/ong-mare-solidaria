# Changelog

Todas as mudanças relevantes do projeto ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-09-30

### Adicionado
- Modo escuro e modo de alto contraste, com botões "Tema" no rodapé (Automático, Claro, Escuro e Alto contraste). A escolha fica salva no navegador.
- No modo Automático, o site segue `prefers-color-scheme` e `prefers-contrast` do sistema operacional, mesmo sem JavaScript.
- Suporte ao modo de alto contraste do Windows (`forced-colors`).

### Alterado
- O CSS passou a usar tokens de cor semânticos (`--cor-fundo`, `--cor-texto`, `--cor-acao`...) no lugar das cores da paleta. O visual do tema claro não mudou.
- O gráfico usa as cores do tema e se redesenha quando o tema muda.

## [1.0.0] - 2026-09-28

Primeira versão estável, pronta para produção.

### Adicionado
- Link "Pular para o conteúdo" em todas as páginas (WCAG 2.4.1).
- `package.json` com os scripts `dev`, `test`, `build` e `preview`.
- Build de produção com esbuild: CSS e JS minificados em um arquivo cada.
- 13 testes automatizados para máscaras, validações e busca de CEP.
- Workflow do GitHub Actions: testes e build em cada Pull Request e deploy automático no GitHub Pages.
- README completo e modelo de Pull Request.

### Corrigido
- Rolagem horizontal em telas de 320px com o texto ampliado (WCAG 1.4.10).

### Otimizado
- CSS 33% menor, JS 56% menor e HTML 17% menor. De 17 para 2 requisições de CSS e JS.
- Removido o peso de fonte Bitter 500, que era baixado sem uso.

## [0.3.0] - 2026-09-27

Estado do projeto ao final das atividades 1 a 3.

### Adicionado
- Páginas `index`, `projetos` e `cadastro` em HTML5 semântico.
- Design system em CSS, grid de 12 colunas com 5 breakpoints e componentes de feedback.
- SPA com History API, validação do formulário, máscaras, busca de CEP, `localStorage` e gráfico com Chart.js.

[1.1.0]: https://github.com/R7ramon2/ong-mare-solidaria/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/R7ramon2/ong-mare-solidaria/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/R7ramon2/ong-mare-solidaria/releases/tag/v0.3.0
