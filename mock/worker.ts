import Mock, { Random } from 'mockjs';
import moment from 'moment';

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
    const date1 = moment().startOf('week').add(1 + days, 'days').add(min, 'hours');
    const date2 = moment().startOf('week').add(1 + days, 'days').add(max, 'hours');
    return [date1, date2];
  },
  worker() {
    return this.pick(workers);
  },
});

export default {
  'GET /api/workers': function(req, res) {
    res.status(200).send({
      data: Mock.mock({
        "list|100": [
          {
            worker: '@worker',
            ranges: '@ranges',
            doctor: '@doctor',                                  
          }
        ]
      }).list
    });
  }
}