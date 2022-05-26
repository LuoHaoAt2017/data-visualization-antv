import { GetDutyList } from '@/services';

export default {
  namespace: 'DutyModel',
  state: {
    dutyList: [],
  },
  reducers: {
    updateList(state, action) {
      return {
        ...state,
        dutyList: action.payload,
      };
    },
  },
  effects: {
    *getDutyList({}, { put, call }) {
      try {
        const resp = yield call(GetDutyList);
        yield put({
          type: 'updateList',
          payload: resp.data,
        });
      } catch (err) {
        console.error(err);
      }
    },
  },
};
