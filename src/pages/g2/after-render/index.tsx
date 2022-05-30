import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { useDispatch } from 'umi';
import { Chart, registerShape } from '@antv/g2';
import type { IGroup } from '@antv/g2';
import { Tooltip } from 'antd';
import { ceil } from 'lodash';
import moment from 'moment';
import { Weeks, WeekLabel } from '@/utils/index';
import InfoIcon from '@/assets/svg/info.svg';

import './index.less';
import e from '@umijs/deps/compiled/express';

const format = 'HH:mm';

const chartW = 800;
const chartH = 420;
const radius = 24;
const IdleColor = '#EDEFF1';
const MinutesPerHour = 60;
const PaddingTop = 60;
const PaddingRight = 20;
const PaddingBottom = 0;
const PaddingLeft = 60;

interface Point {
  x: number;
  y: number;
}

function getAxisX(dutyTime): number {
  const hours = moment(dutyTime, format).hours();
  const minutes = moment(dutyTime, format).minutes();
  const width = chartW - PaddingLeft - PaddingRight;
  return ceil(((hours + minutes / MinutesPerHour) / 24) * width, 4);
}

function getAxisY(dutyTime): number {
  const hours = moment(dutyTime, format).hours();
  const minutes = moment(dutyTime, format).minutes();
  return ceil((hours + minutes / MinutesPerHour) / 24, 4);
}

function mergeInterval(intervals: [string, string][]) {
  // return [['00:00', '23:59']];
  // return [];
  intervals = intervals.filter((x) =>
    moment(x[0], format).isBefore(moment(x[1], format)),
  );
  if (!intervals || intervals.length === 0) {
    return [];
  }
  intervals.sort((a, b) =>
    moment(a[0], format).isBefore(moment(b[0], format)) ? -1 : 1,
  );
  let prev: [string, string] = intervals[0];
  const result: any[] = [];
  for (let i = 0; i < intervals.length; i++) {
    const curr = intervals[i];
    if (moment(curr[0], format).isAfter(moment(prev[1], format))) {
      result.push(prev);
      prev = curr;
    } else {
      prev[1] = moment(curr[1], format).isAfter(moment(prev[1], format))
        ? curr[1]
        : prev[1];
    }
  }
  result.push(prev);
  return result;
}

function getIdleTimes(intervals: [string, string][]) {
  const idles: any[] = [];
  let prev = '00:00';
  for (let i = 0; i < intervals.length; i++) {
    if (!moment(prev, format).isSame(moment(intervals[i][0], format))) {
      idles.push([prev, intervals[i][0]]);
    }
    prev = intervals[i][1];
  }
  if (prev !== '23:59') {
    idles.push([prev, '23:59']);
  }
  return idles;
}

// 自定义图形
registerShape('interval', 'duty', {
  draw(info: any, container: IGroup) {
    // svg | canvas
    const points = info.points as Point[];
    let path = [
      ['M', points[0].x, points[0].y],
      ['L', (points[1].x + points[2].x) / 2, points[1].y],
      ['L', points[3].x, points[3].y],
      ['Z'],
    ];
    const dutyTitle = info.data.dutyTitle;
    const dutyColor = info.data.dutyColor;
    let dutyTimes = info.data.dutyTimes;
    dutyTimes = mergeInterval(dutyTimes);
    const idleTimes = getIdleTimes(dutyTimes);
    dutyTimes.forEach((dutyTime: [string, string]) => {
      const start = getAxisY(dutyTime[0]);
      const finish = getAxisY(dutyTime[1]);
      path = [
        ['M', points[0].x, start],
        ['L', points[0].x, finish],
        ['L', points[3].x, finish],
        ['L', points[3].x, start],
        ['Z'],
      ];
      path = this.parsePath(path);
      container.addShape('path', {
        id: 'custom-bar-path',
        attrs: {
          path,
          fill: dutyColor,
          fillOpacity: 0.5,
        },
      });
    });
    idleTimes.forEach((idleTime: [string, string]) => {
      const start = getAxisY(idleTime[0]);
      const finish = getAxisY(idleTime[1]);
      path = [
        ['M', points[0].x, start],
        ['L', points[0].x, finish],
        ['L', points[3].x, finish],
        ['L', points[3].x, start],
        ['Z'],
      ];
      path = this.parsePath(path);
      container.addShape('path', {
        attrs: {
          path,
          fill: IdleColor,
          fillOpacity: 1.0,
        },
      });
      if (finish - start > 0.05) {
        container
          .addShape('image', {
            attrs: {
              x:
                PaddingLeft +
                ((finish + start) / 2) * (chartW - PaddingLeft - PaddingRight) -
                radius / 2,
              y: info.y - radius / 2,
              width: radius,
              height: radius,
              img: InfoIcon,
            },
          })
          .on('mouseover', function (evt) {
            const tooltip = document.getElementById('tooltip');
            if (tooltip) {
              tooltip.style.top = evt.y - 20 + 'px';
              tooltip.style.left = evt.x + 20 + 'px';
              ReactDOM.render(
                <div className="tooltip-concent">当前时段暂无排班</div>,
                tooltip,
              );
            }
          })
          .on('mouseout', function (evt) {
            const tooltip = document.getElementById('tooltip');
            if (tooltip) {
              ReactDOM.render(<></>, document.getElementById('tooltip'));
            }
          });
      }
    });
    return container;
  },
});

const AfterRender = ({ dutyList }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'DutyModel/getDutyList',
    });
  }, []);

  useEffect(() => {
    const container = document.getElementById('container');
    if (container) {
      container.innerHTML =
        '<div id="annotation" class="annotation"></div><div id="tooltip" class="tooltip"></div>';
    }
    const chart = new Chart({
      container: 'container',
      width: chartW,
      height: chartH,
      padding: [PaddingTop, PaddingRight, PaddingBottom, PaddingLeft],
      renderer: 'svg',
    });
    chart.interval().position('dutyWeek*dutyCount').shape('duty').size(32);
    chart.axis('dutyWeek', {
      label: {
        formatter(text: string, item: any, index: number) {
          return WeekLabel[text];
        },
        style: (text: string, index: number) => {
          console.log('params: ');
          if (index === 5 || index === 6) {
            return {
              stroke: 'green',
              fontWeight: 'lighter',
              fontFamily: 'MicrosoftYaHei',
            };
          } else {
            return {
              stroke: '#000000',
              fontWeight: 'lighter',
              fontFamily: 'MicrosoftYaHei',
            };
          }
        },
        autoEllipsis: true,
      },
      tickLine: {
        length: 0,
        alignTick: true,
      },
      grid: {
        line: {
          type: 'line',
          style: {
            strokeOpacity: 0.15,
          },
        },
        alignTick: false, // 是否同刻度线对齐，如果值为 false，则会显示在两个刻度中间。
      },
    });
    chart.axis('dutyCount', {
      position: 'right',
      label: {
        formatter(text: string, item: any, index: number) {
          if (index === 12) {
            return '12/h';
          }
          return text;
        },
      },
      line: {
        style: {
          stroke: '#ccc',
        },
      },
      tickLine: {
        length: 0,
        alignTick: true,
      },
      grid: {
        line: {
          style: {
            opacity: 0,
          },
        },
      },
    });
    chart.scale({
      dutyWeek: {},
      dutyCount: {
        max: 24,
        min: 0,
        tickCount: 12,
      },
    });
    chart.coordinate().transpose();
    chart.legend(false);
    chart.tooltip(false);
    chart.on('afterrender', function (e) {
      const html: string[] = [];
      const elements = e.view.getElements();
      elements.forEach(function (elem) {
        let info = elem.getData();
        const y = elem.model.y - 8;
        const dutyTimes = mergeInterval(info.dutyTimes);
        dutyTimes.forEach((dutyTime: [string, string]) => {
          const start = getAxisX(dutyTime[0]);
          const finish = getAxisX(dutyTime[1]);
          html.push(
            `<label class="annotation-item" style="top: ${y}px; left: ${
              start + PaddingLeft
            }px; width: ${finish - start}px;"><span class="annotation-text">${
              info.dutyTitle
            }<span></label>`,
          );
        });
      });
      const $annotation = document.getElementById('annotation');
      if ($annotation) {
        $annotation.innerHTML = html.join('');
      }
    });
    chart.data(dutyList);
    chart.render();
  }, [dutyList]);

  return (
    <div id="container" className="container">
      <div id="annotation" className="annotation"></div>
      <div id="tooltip" className="tooltip"></div>
    </div>
  );
};

function collect(doctors) {
  if (doctors.length === 0) {
    return [];
  }
  // 收集所有的班种信息
  const dutyList: any[] = [];
  doctors.forEach((user) => {
    Object.keys(user).forEach(function (key) {
      if (Weeks.includes(key) && user[key].dutyRefid) {
        dutyList.push(user[key]);
      }
    });
  });
  if (dutyList.length === 0) {
    return [];
  }
  return dutyList.reduce(
    function (prev, curr) {
      const dutyWeek = curr.dutyWeek;
      const index = prev.findIndex((x) => x.dutyWeek === dutyWeek);
      if (index > -1) {
        prev[index].dutyRefid = curr.dutyRefid;
        prev[index].dutyTitle = curr.dutyTitle;
        prev[index].dutyColor = curr.dutyColor;
        prev[index].dutyTimes.push(curr.dutyTime);
        prev[index].dutyCount = 24;
      }
      return prev;
    },
    [
      {
        dutyWeek: 'mon',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'tue',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'wed',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'thu',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'fri',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'sat',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
      {
        dutyWeek: 'sun',
        dutyRefid: '',
        dutyTitle: '',
        dutyColor: '',
        dutyTimes: [],
      },
    ],
  );
}

export default connect(({ DutyModel }) => {
  return {
    dutyList: collect(DutyModel.dutyList),
  };
})(AfterRender);
