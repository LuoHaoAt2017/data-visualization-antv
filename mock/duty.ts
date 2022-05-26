import Mock, { Random } from 'mockjs';
import moment from 'moment';

const Weeks = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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
  dutyTitle() {
    return Random.province();
  },
  dutyColor() {
    return Random.color();
  },
  dutyDate() {
    return Random.date();
  },
  dutyTime() {
    const start = Random.date('yyyy-MM-dd HH:mm');
    const duration = Math.floor(Math.random() * 10);
    const end = moment(start).add(duration, 'hours');
    return [moment(start).format('HH:mm'), moment(end).format('HH:mm')];
  },
  dutyWeek() {
    return this.pick(Weeks);
  },
});

const DutyList = Mock.mock({
  'list|9': [
    {
      dutyRefid: '@dutyRefid',
      dutyTitle: '@dutyTitle',
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
      }).list.map((elem) => ({
        key: elem.key,
        userId: elem.userId,
        userName: elem.userName,
        spelling: elem.spelling,
        userRank: elem.userRank,
        mon: {
          ...elem.mon,
          dutyWeek: 'mon',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        tue: {
          ...elem.tue,
          dutyWeek: 'tue',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        wed: {
          ...elem.wed,
          dutyWeek: 'wed',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        thu: {
          ...elem.thu,
          dutyWeek: 'thu',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        fri: {
          ...elem.fri,
          dutyWeek: 'fri',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        sat: {
          ...elem.sat,
          dutyWeek: 'sat',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
        sun: {
          ...elem.mon,
          dutyWeek: 'sun',
          dutyTime: Mock.mock(
            {
              dutyTime: '@dutyTime',
            }.dutyTime,
          ),
        },
      })),
      status: 200,
    });
  },
};
