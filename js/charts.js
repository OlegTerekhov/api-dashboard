let overviewChart = null;

export function createOverviewChart(data) {
  const canvas = document.querySelector("#overview-chart");

  if (overviewChart) {
    overviewChart.destroy();
  }

  overviewChart = new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "Пользователи",
        "Посты",
        "Комментарии"
      ],

      datasets: [
        {
          label: "Количество",

          data: [
            data.users.total,
            data.posts.total,
            data.comments.total
          ],

          borderWidth: 0,

          borderRadius: 8,

          maxBarThickness: 70
        }
      ]
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },

        tooltip: {
          padding: 12,

          titleFont: {
            size: 14
          },

          bodyFont: {
            size: 14
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },

          ticks: {
            font: {
              size: 13
            }
          }
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "#e5e7eb"
          },

          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}