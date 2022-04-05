import React from 'react';
import { connect } from 'dva';
import { Chart } from '@antv/g2';

import styles from './index.less';
import moment, { Moment } from 'moment';
import Mock from 'mockjs';

// moment.locale('zh');

const doctors = [
  {
    lable: '初诊医生',
    value: 'diagnose',
  },
  {
    lable: '审核医生',
    value: 'audit',
  },
];

const workers = [
  {
    name: '眼科医生',
    code: '0001',
  },
  {
    name: '耳科医生',
    code: '0002',
  },
  {
    name: '鼻科医生',
    code: '0003',
  },
];

Mock.Random.extend({
  doctor() {
    return this.pick(doctors);
  },
  ranges() {
    const days = Mock.Random.integer(0, 6);
    const min = Mock.Random.integer(0, 12);
    const max = Mock.Random.integer(min, min + Mock.Random.integer(0, 11));
    const date1 = moment().startOf('week').add(days, 'days').add(min, 'hours');
    const date2 = moment().startOf('week').add(days, 'days').add(max, 'hours');
    return [date1.format('YYYY-MM-DD HH:mm'), date2.format('YYYY-MM-DD HH:mm')];
  },
  worker() {
    return this.pick(workers);
  },
});

interface Action {
  type: string;
  payload: any;
  callback?: Function;
}

interface IProps {
  workers: [];
  loading: boolean;
  dispatch: (action: Action) => {};
}

interface IState {}

interface IWorker {
  doctor: { label: string; value: string };
  worker: { code: string; name: string };
  ranges: Moment[];
}

class Workers extends React.Component<IProps, IState> {
  chart: Chart = null;

  constructor(props: IProps) {
    super(props);
    this.createChart = this.createChart.bind(this);
    this.renderChart = this.renderChart.bind(this);
  }

  componentDidMount() {
    this.createChart();
    this.renderChart();
  }

  render() {
    return <div id="chart"></div>;
  }

  createChart() {
    const chart = new Chart({
      container: 'chart',
      autoFit: true,
    });

    chart.render();
    this.chart = chart;
  }

  renderChart() {
    const chart = this.chart;
    const workers = this.formatData();
    // 每一天的 worker 的集合
    const data = workers.diagnose;

    console.log('data: ', data);
    // chart.data(workers);
  }

  formatData() {
    const workers = Mock.mock({
      'list|100': [
        {
          worker: '@worker',
          ranges: '@ranges',
          doctor: '@doctor',
        },
      ],
    }).list;
    const diagnoseData = workers.filter(
      (elem: IWorker) => elem.doctor.value === 'diagnose',
    );
    const auditData = workers.filter(
      (elem: IWorker) => elem.doctor.value === 'audit',
    );
    const result1 = new Map();
    const result2 = new Map();
    diagnoseData.forEach((elem: IWorker) => {
      const day = moment(elem.ranges[0]).format('YYYY-MM-DD');
      if (!result1.has(day)) {
        result1.set(day, []);
      }
      const values = result1.get(day);
      values.push(elem);
      result1.set(day, values);
    });
    auditData.forEach((elem: IWorker) => {
      const day = moment(elem.ranges[0]).format('YYYY-MM-DD');
      if (!result2.has(day)) {
        result2.set(day, []);
      }
      const values = result2.get(day);
      values.push(elem);
      result2.set(day, values);
    });

    function strMapToObj(strMap: any) {
      let obj = Object.create(null);
      for (let [k,v] of strMap) {
        obj[k] = v;
      }
      return obj;
    }
    
    return {
      diagnose: strMapToObj(result1),
      audit: strMapToObj(result2),
    };
  }
}

export default connect(({ WorkerModel, loading }) => {
  return {
    workers: WorkerModel.workers,
    loading: loading,
  };
})(Workers);
