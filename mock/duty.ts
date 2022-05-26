import Mock, { Random } from 'mockjs';

Mock.Random.extend({
  uuid() {
    return Random.guid();
  },
  userId() {
    return Random.guid();
  },
  userName() {
    return Random.cname();
  },
  spelling() {
    return Random.name();
  },
  userRank() {
    return Random.integer(1, 9);
  },
  dutyRefid() {
    return Random.guid();
  },
  dutyName() {
    return Random.cname();
  },
  dutyColor() {
    return Random.color();
  },
  dutyDate() {
    return Random.date();
  },
});

const DutyList = Mock.mock({
  'list|9': [
    {
      dutyRefid: '@dutyRefid',
      dutyName: '@dutyName',
      dutyColor: '@dutyColor',
    },
  ],
}).list;

Mock.Random.extend({
  dutyIndex() {
    return Random.integer(1, 9);
  },
  dutyItem() {
    return this.pick(DutyList);
  },
});

export default {
  'GET /api/dutys': (req, res) => {
    res.send({
      data: Mock.mock({
        'list|100': [
          {
            key: '@userId',
            userId: '@userId',
            userName: '@userName',
            spelling: '@spelling',
            userRank: '@userRank',
            mon: '@dutyItem',
            tue: '@dutyItem',
            wed: '@dutyItem',
            thu: '@dutyItem',
            fri: '@dutyItem',
            sat: '@dutyItem',
            sun: '@dutyItem',
          },
        ],
      }).list,
    });
  },
};
