import { Chart } from "@antv/g2";

$(function () {
  const chart = initChart();
  loadData(chart);
  drawChart(chart);
  chart.render();
});

function initChart() {
  const chart = new Chart({
    container: "app",
    height: 600,
    padding: [100, 100],
    autoFit: true,
  });
  // chart.option('slider', false);
  // chart.legend(false);
  // chart.legend('radius', false); // 隐藏 size 图例
  // chart.legend('period', false); // 隐藏 size 图例
  // chart.legend('title', false); // 隐藏 color 图例
  return chart;
}

function loadData(chart) {
  const data = [
    {
      name: "水星",
      title: "Mercury",
      radius: 2440,
      period: 88,
      url: "asstes/Mercury.jpg",
    },
    {
      name: "金星",
      title: "Venus",
      radius: 6052,
      period: 225,
      url: "asstes/Venus.jpg",
    },
    {
      name: "地球",
      title: "Earth",
      radius: 6378,
      period: 365,
      url: "asstes/Earth.jpg",
    },
    {
      name: "火星",
      title: "Mars",
      radius: 3397,
      period: 687,
      url: "asstes/Mars.jpg",
    },
  ];
  chart.data(data);
}

function drawChart(chart) {
  // chart.<geomType>().<attrType>(dims, [callback]);
  chart
    .point()
    .label("title", (val) => {
      return val;
    }, {
      offsetX: 40, 
      offsetY: -40,
    })
    .position("title*radius")
    .color("title", (value) => {
      switch(value) {
        case 'Mercury': return 'black';
        case 'Venus': return 'grey';
        case 'Earth': return 'blue';
        case 'Mars': return 'red';
      }
    })
    // .shape('url', url => ['image', url])
    .shape('period*radius', (period, radius) => {
      if (period > 300 && radius > 3000) {
        return 'circle';
      }
      return 'square'
    })
    .size("radius", (size) => size / 200);
}
