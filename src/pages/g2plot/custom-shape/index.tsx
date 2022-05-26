import { useEffect } from 'react';
import { connect } from 'dva';
import { useDispatch } from 'umi';
import { Chart, registerShape, registerTheme } from '@antv/g2';
import moment from 'moment';

import { Weeks, WeekLabel } from '@/utils/index';

import styles from './index.less';

interface Point {
  x: number;
  y: number;
}

// 自定义图形
registerShape('interval', 'duty', {
  draw(info, container) {
    const { style, defaultStyle = {} } = info;
    const points = info.points as Point[];
    let path = [
      ['M', points[0].x, points[0].y],
      ['L', (points[1].x + points[2].x) / 2, points[1].y],
      ['L', points[3].x, points[3].y],
      ['Z'],
    ];

    path = this.parsePath(path);

    return container.addShape('path', {
      attrs: {
        path,
        ...defaultStyle,
        ...style,
      },
    });
  },
});

registerTheme('customTheme', {
  defaultColor: 'black',
});

const DutyChart = ({ dutyList, dutyRefid }) => {
  console.log('dutyList: ', dutyList, ' dutyRefid: ', dutyRefid);
  useEffect(() => {
    const chart = new Chart({
      container: dutyRefid,
      autoFit: true,
      padding: [60, 60, 60, 80],
      renderer: 'svg',
      theme: 'customTheme',
    });
    chart
      .interval({
        sortable: true,
        visible: true,
      })
      .position('dutyWeek*dutyCount')
      .color('dutyWeek');
    chart.axis('dutyWeek', {
      label: {
        formatter(text: string, item: any, index: number) {
          return WeekLabel[text];
        },
        autoEllipsis: true,
      },
      tickLine: {
        length: 0,
        alignTick: false,
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
      position: 'right',
      line: {
        style: {
          stroke: '#ccc',
        },
      },
      tickLine: {
        length: 0,
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
    chart.legend(false);
    chart.interaction('element-active');
    chart.coordinate().transpose();
    chart.data(dutyList);
    chart.render();
  }, []);

  return <div id={dutyRefid}></div>;
};

const CustomShape = ({ dutyGroup }) => {
  console.log('dutyGroup: ', dutyGroup);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'DutyModel/getDutyList',
    });
  }, []);

  return (
    <div className={styles.container}>
      {Object.keys(dutyGroup).map((key) => (
        <div id={key} key={key} className={styles.chart}>
          <DutyChart dutyList={dutyGroup[key]} dutyRefid={key} />
        </div>
      ))}
    </div>
  );
};

function collect(doctors) {
  if (doctors.length === 0) {
    return [];
  }
  // 收集所有的班种信息
  const dutys: any[] = [];
  doctors.forEach((user) => {
    Object.keys(user).forEach(function (key) {
      if (Weeks.includes(key) && user[key].dutyRefid) {
        dutys.push(user[key]);
      }
    });
  });
  if (dutys.length === 0) {
    return [];
  }
  // 将同一个班种的数据收集起来
  const dutyMap: any = {};
  dutys.forEach(function (duty) {
    const dutyRefid = duty.dutyRefid;
    if (!dutyMap[dutyRefid]) {
      dutyMap[dutyRefid] = [];
    }
    const items: any[] = dutyMap[dutyRefid];
    items.push(duty);
    try {
      dutyMap[dutyRefid] = items;
    } catch (err) {
      console.log(err);
    }
  });

  return dutyMap;
}

function aggregate(dutyMap) {
  const targetData = {};
  Object.keys(dutyMap).forEach((dutyRefid) => {
    const dutyList = dutyMap[dutyRefid]; // 同一个班种不同时间段的排班
    targetData[dutyRefid] = dutyList.reduce(
      function (prev, curr) {
        const dutyWeek = curr.dutyWeek;
        prev[dutyWeek].dutyRefid = curr.dutyRefid;
        prev[dutyWeek].dutyTitle = curr.dutyTitle;
        prev[dutyWeek].dutyColor = curr.dutyColor;
        prev[dutyWeek].dutyTimes.push(curr.dutyTime);
        return prev;
      },
      {
        mon: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        tue: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        wed: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        thu: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        fri: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        sat: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
        sun: {
          dutyRefid: '',
          dutyTitle: '',
          dutyColor: '',
          dutyTimes: [],
        },
      },
    );
  });
  return targetData;
}

function betterAggregate(dutyMap) {
  const targetData = {};
  Object.keys(dutyMap).forEach((dutyRefid) => {
    const dutyList = dutyMap[dutyRefid]; // 同一个班种不同时间段的排班
    targetData[dutyRefid] = dutyList.reduce(
      function (prev, curr) {
        const dutyWeek = curr.dutyWeek;
        const index = prev.findIndex((x) => x.dutyWeek === dutyWeek);
        if (index > -1) {
          prev[index].dutyRefid = curr.dutyRefid;
          prev[index].dutyTitle = curr.dutyTitle;
          prev[index].dutyColor = curr.dutyColor;
          prev[index].dutyTimes.push(curr.dutyTime);
          prev[index].dutyCount = Math.floor(Math.random() * 24);
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
  });
  return targetData;
}

function mergeInterval(intervals) {
  intervals = intervals.filter((x) => moment(x[0]).isBefore(x[1]));
  intervals.sort((a, b) => (moment(a[0]).isBefore(b[0]) ? -1 : 1));
  let prev: any[] = intervals[0];
  const result: any[] = [];
  for (let i = 0; i < intervals.length; i++) {
    const cur = intervals[i];
    if (cur[0] > prev[1]) {
      result.push(prev);
      prev = cur;
    } else {
      prev[1] = moment(cur[1]).isAfter(prev[1]) ? cur[1] : prev[1];
    }
  }
  result.push(prev);
  return result;
}

export default connect(({ DutyModel }) => {
  return {
    dutyGroup: betterAggregate(collect(DutyModel.dutyList)),
  };
})(CustomShape);
