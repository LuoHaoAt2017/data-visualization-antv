import { useEffect } from 'react';
import { connect } from 'dva';
import { useDispatch } from 'umi';
import { Chart, registerShape } from '@antv/g2';
import type { IGroup } from '@antv/g2';
import { Tooltip } from 'antd';
import { ceil } from 'lodash';
import moment from 'moment';
import { Weeks, WeekLabel } from '@/utils/index';

import './index.less';

const format = 'HH:mm';

const chartW = 800;
const chartH = 800;
const radius = 24;

interface Point {
  x: number;
  y: number;
}

function getAxisX(dutyTime): number {
  const hours = moment(dutyTime, format).hours();
  const minutes = moment(dutyTime, format).minutes();
  const width = 800 - 120;
  return ceil(((hours + minutes / 60) / 24) * width, 4);
}

function getAxisY(dutyTime): number {
  const hours = moment(dutyTime, format).hours();
  const minutes = moment(dutyTime, format).minutes();
  return ceil((hours + minutes / 60) / 24, 4);
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
    const { style, defaultStyle = {} } = info;
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
          ...defaultStyle,
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
          ...defaultStyle,
          fill: '#cccccc',
          fillOpacity: 0.25,
        },
      });
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
      container.innerHTML = '<div id="annotation" class="annotation"></div>';
    }
    const chart = new Chart({
      container: 'container',
      autoFit: true,
      padding: [60, 60, 60, 60],
      renderer: 'svg',
    });
    chart
      .interval({
        sortable: true,
        visible: true,
      })
      .position('dutyWeek*dutyCount')
      .shape('duty');
    chart.axis('dutyWeek', {
      label: {
        formatter(text: string, item: any, index: number) {
          return WeekLabel[text];
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
            strokeOpacity: 0.25,
          },
        },
        alignTick: false, // 是否同刻度线对齐，如果值为 false，则会显示在两个刻度中间。
      },
    });
    chart.axis('dutyCount', {
      position: 'left',
      line: {
        style: {
          stroke: '#ccc',
        },
      },
      tickLine: {
        length: 4,
        alignTick: true,
      },
      title: {
        text: '小时',
        position: 'end',
        // offset: 10,
        spacing: 10,
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
      dutyCount: {
        max: 24,
        min: 0,
        tickCount: 12,
      },
    });
    chart.coordinate().rotate(Math.PI * 0.5);
    chart.legend(false);
    chart.tooltip(false);
    chart.on('afterrender', function (e) {
      const html: string[] = [];
      const elements = e.view.getElements();
      elements.forEach(function (elem) {
        let info = elem.getData();
        const y = elem.model.y - 8;
        console.log('elem info: ', elem);
        const dutyTimes = mergeInterval(info.dutyTimes);
        const idleTimes = getIdleTimes(dutyTimes);
        dutyTimes.forEach((dutyTime: [string, string]) => {
          const start = getAxisX(dutyTime[0]);
          const finish = getAxisX(dutyTime[1]);
          html.push(`
            <span class="annotation-item" 
              style="top: ${y}px; left: ${start + 60}px; width: ${
            finish - start
          }px;">
              ${info.dutyTitle}
            </span>`);
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

  return <div id="container" className="container"></div>;
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
