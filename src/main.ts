import { Graph } from "@antv/x6";
$(function() {
  const $root = $('<div id="container">hello world</div>');
  $root.css({
    "margin": "0 auto",
    "font-size": "14px"
  });
  $('#app').append($root);

  const nodes = [
    {
      id: "node1",
      x: 40,
      y: 40,
      width: 80,
      height: 40,
      shape: 'rect',
      attrs: {
        body: {
          fill: '#2ECC71',
          stroke: '#000',
          strokeDasharray: '10,2',
        },
        label: {
          text: 'hello',
          fill: '#333',
          fontSize: 13,
        }
      }
    },
    {
      id: "node2",
      x: 160,
      y: 180,
      width: 80,
      height: 40,
      shape: 'ellipse',
      attrs: {
        body: {
          fill: '#F39C12',
          stroke: '#000',
          rx: 16,
          ry: 16,
        },
        label: {
          text: 'world',
          fill: '#333',
          fontSize: 13,
          fontWeight: 'bold',
        }
      }
    },
  ];

  const edges = [
    {
      source: "node1",
      target: "node2",
      attrs: {
        line: {
          stroke: 'orange',
        }
      }
    },
  ];

  const canvas = new Graph({
    container: $root[0],
    width: 800,
    height: 600,
    background: {
      color: '#fffbe6', // 设置画布背景颜色
    },
    grid: {
      size: 20, // 网格大小
      visible: true
    }
  });

  canvas.fromJSON({
    nodes: nodes,
    edges: edges
  });

  canvas.zoom(0.5);
  canvas.translate(80, 40);
});