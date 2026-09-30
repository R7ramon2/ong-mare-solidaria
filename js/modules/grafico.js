// Gráfico de refeições da página inicial, feito com o Chart.js.
//
// A biblioteca vem do CDN jsDelivr como módulo ES e só é baixada
// (com import() dinâmico) se a página tiver o gráfico. Como é um
// módulo, o Chart fica numa variável local: nada é criado no escopo
// global (window) e não há risco de conflito com o resto do código.
//
// Os números saem da tabela do HTML, que é a fonte dos dados. Se o
// CDN falhar, a tabela é aberta e a pessoa vê os mesmos dados.

const URL_CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/auto/+esm';

let graficoAtual = null;

// quando o tema muda, redesenha o gráfico com as cores novas
document.addEventListener('mare:tema', function () {
  if (document.getElementById('grafico-refeicoes')) iniciarGrafico();
});

// pega as cores do design system (variaveis.css) para o gráfico
function corDoTema(variavel) {
  return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();
}

function lerTabela(tabela) {
  const meses = [];
  const valores = [];
  tabela.querySelectorAll('tbody tr').forEach(function (linha) {
    meses.push(linha.querySelector('th').dataset.curto);
    // "1.520" -> 1520
    valores.push(Number(linha.querySelector('td').textContent.replace(/\D/g, '')));
  });
  return { meses: meses, valores: valores };
}

export async function iniciarGrafico() {
  const canvas = document.getElementById('grafico-refeicoes');
  if (!canvas) return;

  const tabela = document.getElementById('tabela-refeicoes');
  const detalhes = document.getElementById('dados-refeicoes');
  const dados = lerTabela(tabela);

  // na SPA o canvas é recriado; destrói o gráfico antigo para liberar memória
  if (graficoAtual) {
    graficoAtual.destroy();
    graficoAtual = null;
  }

  try {
    const modulo = await import(URL_CHARTJS);
    const Chart = modulo.default;

    // usa a mesma fonte e cor de texto do site
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    Chart.defaults.color = corDoTema('--cor-texto-apoio');
    Chart.defaults.borderColor = corDoTema('--cor-borda');

    const semAnimacao = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    graficoAtual = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: dados.meses,
        datasets: [{
          label: 'Refeições servidas',
          data: dados.valores,
          backgroundColor: corDoTema('--cor-link'),
          hoverBackgroundColor: corDoTema('--cor-acao'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: semAnimacao ? false : { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (item) {
                return item.parsed.y.toLocaleString('pt-BR') + ' refeições';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: function (valor) { return valor.toLocaleString('pt-BR'); } }
          },
          x: { grid: { display: false } }
        }
      }
    });
  } catch (erro) {
    // sem internet ou CDN fora do ar: esconde o canvas e mostra a tabela
    canvas.parentElement.hidden = true;
    detalhes.open = true;
  }
}
