import { Chart } from "@antv/g2";

window.onload = function () {
  const chart = initChart();
  setMaps(chart);
  loadData(chart);
  chart.render();
};

function initChart() {
  const chart = new Chart({
    container: "app",
    height: 600,
    padding: [20, 100],
    autoFit: true,
  });
  return chart;
}

function loadData(chart) {
  const data = [
    {
      name: "明 | 宣德窑 | 青花描红云龙纹合碗",
      time: 1426,
      size: 127.01999999999998,
      color: [
        [113.61791967044336, 41.56745623069223, 17.713697219359133],
        [150.5673289183225, 153.89448123620434, 148.9646799117],
        [82.16709511568114, 96.03856041131172, 110.71379605826922],
      ],
      url: "https://gw.alipayobjects.com/zos/rmsportal/wxiFrnPFTozrbQMRLUQc.png",
    },
    {
      name: "南宋 | 龙泉窑 | 青瓷莲瓣碗",
      time: 960,
      size: 281.7,
      color: [
        [87.33020134228224, 115.07248322147646, 64.18926174496552],
        [47.64470588235352, 42.89411764705878, 25.555294117646497],
      ],
      url: "https://gw.alipayobjects.com/zos/rmsportal/YgOyMtxYjDRflrndZAXo.png",
    },
  ];
  chart.data(data);
}

function setMaps(chart) {
  chart
    .point()
    .label("name", { offset: -20 })
    .position("time*1")
    .color("color", color => color)
    .shape('url', url => ['image', url])
    .size("size", (size) => size / 5);
}
