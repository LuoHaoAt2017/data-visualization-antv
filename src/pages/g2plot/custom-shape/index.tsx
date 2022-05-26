import { useEffect } from 'react';
import { connect } from 'dva';
import { useDispatch } from 'umi';
import { isObject, deepMix } from '@antv/util';
import { P, G2 } from '@antv/g2plot';
import { Weeks } from '@/utils/index';

interface Point {
  x: number;
  y: number;
}

// 自定义图形
G2.registerShape('interval', 'hill', {
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

const CustomShape = ({ dutyList }) => {
  console.log('dutyList: ', dutyList);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'DutyModel/getDutyList',
    });
  }, []);

  useEffect(() => {
    // 1. 定义配置
    const defaultOptions: any = {
      columnWidthRatio: 1.2,
    };

    // 2. adaptor 实现
    function adaptor(params) {
      const { chart, options } = params;
      const { data, xField, yField, columnWidthRatio, columnStyle, theme } =
        options;

      // 数据
      chart.data(data);

      // 几何图形
      const i = chart
        .interval()
        .position(`${xField}*${yField}`)
        .shape('hill')
        .style(`${xField}*${yField}`, (x, y) => {
          return typeof columnStyle === 'function'
            ? columnStyle({ [xField]: x, [yField]: y })
            : columnStyle;
        });

      // 设置重叠比率
      chart.theme(
        deepMix({}, isObject(theme) ? theme : G2.getTheme(theme), {
          columnWidthRatio: columnWidthRatio,
        }),
      );

      const gap = (1 / data.length / 2) * columnWidthRatio; // 左右预留
      chart.scale({
        genre: {
          range: [gap, 1 - gap],
        },
      });

      return params;
    }

    // 3. G2Plot 上使用
    const data = [
      { genre: 'Sports', sold: 275 },
      { genre: 'Strategy', sold: 115 },
      { genre: 'Action', sold: 120 },
      { genre: 'Shooter', sold: 350 },
      { genre: 'Other', sold: 150 },
    ];

    const hill = new P(
      'container',
      {
        data,
        appendPadding: 16,
        meta: {
          genre: {
            alias: '游戏种类', // 列定义，定义该属性显示的别名
          },
          sold: {
            alias: '销售量',
          },
        },
        xField: 'genre',
        yField: 'sold',
        columnStyle: {
          fillOpacity: 0.3,
        },
      },
      adaptor,
      defaultOptions,
    ); // 引入上述的封装，或者将上述代码发包

    hill.render();
  }, []);

  return <div id="container"></div>;
};

function collectDutyByRefid(doctors) {
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

function aggregateDuty(dutyMap) {
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

export default connect(({ DutyModel }) => {
  return {
    dutyList: aggregateDuty(collectDutyByRefid(DutyModel.dutyList)),
  };
})(CustomShape);
