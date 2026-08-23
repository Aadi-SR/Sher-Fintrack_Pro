/* ============================================================
   chart.js — cash flow bar chart, built with Chart.js.
   Income and expense are grouped by date so the bars show
   spending vs earning over time. The old chart is always
   destroyed before a new one is drawn, so charts never stack.
   ============================================================ */

   
let flowChartInstance = null;

function renderChart() {
  const canvas = document.getElementById('flow-chart');
  const emptyEl = document.getElementById('chart-empty');
  if (!canvas) return;

  const user = Storage.getCurrentUser();
  const all = user ? Storage.getTransactions(user.username) : [];


  // Each time we redraw the chart, we destroy the old one first so they don't stack on top of each other
  if (flowChartInstance) {
    flowChartInstance.destroy();
    // .destroy() is a Chart.js method that removes the chart from the canvas and cleans up any associated resources 
    flowChartInstance = null;
  }

  if (all.length === 0) {
    canvas.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }
  canvas.classList.remove('hidden');
  emptyEl.classList.add('hidden');



  // group income and expense totals by date
  // { date: { income: 0, expense: 0 } } -- format
  const byDate = {};
  all.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = { income: 0, expense: 0 };
    byDate[t.date][t.type] += Number(t.amount);
  });


  // obtain a sorted array of dates to use as the x-axis labels
  const dates = Object.keys(byDate).sort();

  // get the computed styles for the chart colors from CSS variables currently defined in the active theme, so the chart colors match the theme
  const styles = getComputedStyle(document.body);
  const green = styles.getPropertyValue('--green').trim();
  const red = styles.getPropertyValue('--red').trim();
  const gridColor = styles.getPropertyValue('--line').trim();
  const textColor = styles.getPropertyValue('--text-dim').trim();

  

  const ctx = canvas.getContext('2d');
  flowChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates.map(formatDate),
      datasets: [
        {
          label: 'Income',
          data: dates.map(d => byDate[d].income),
          backgroundColor: green,
          borderRadius: 4,
          maxBarThickness: 34
        },
        {
          label: 'Expense',
          data: dates.map(d => byDate[d].expense),
          backgroundColor: red,
          borderRadius: 4,
          maxBarThickness: 34
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: textColor, usePointStyle: true, boxWidth: 8 }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${formatAmount(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: value => formatAmount(value)
          }
        }
      }
    }
  });
}

// redraw so bar colors match the active theme
window.addEventListener('themechange', () => {
  if (document.getElementById('flow-chart')) renderChart();
});