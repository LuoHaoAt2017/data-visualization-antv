import { Chart } from "@antv/g2";
import { Level } from "./helper";
$(function () {
  const chart = new Chart({
    container: "app",
    padding: [100, 100],
    autoFit: true,
    height: 400,
    // renderer: 'svg' // canvas
  });

  $.ajax({
    url: "/caste-system",
    type: "GET",
    async: true,
    dataType: "json",
    success(result) {
      chart.data(result);
      chart
        .point()
        .position("level*age")
        .color("age", function (age) {
          if (age > 90) {
            return 'red';
          } else if (age > 60) {
            return 'green';
          } else {
            return 'blue';
          }
        })
        .size('gender', function(gender) {
          return gender ? 4 : 2;
        })
        .shape("level", function (level) {
          switch (level) {
            case Level.Brahman:
              return "circle";
            case Level.Kshatriya:
              return "square";
            case Level.Vaisha:
              return "diamond";
            case Level.Vaisha:
              return "triangle";
            default:
              return "hexagon";
          }
        });
      chart.legend('gender', false); // 图例
      chart.axis('level', {
        title: {
          text: '种姓',
          position: 'end',
          style: {
            fontSize: 24,
            fontWeight: 600,
            textAlign: 'center'
          }
        }
      });
      chart.axis('age', {
        title: {
          text: '年龄',
          position: 'end',
          style: {
            fontSize: 24,
            fontWeight: 600,
            textAlign: 'center'
          }
        }
      });
      chart.render();
    },
    error(xhr, status, error) {
      console.error(error);
    },
  });
});
