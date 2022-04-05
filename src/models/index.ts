import { GetWorkers } from '@/services';

interface Action {
  type: string;
  payload: any;
}

export default {
  namespace: 'WorkerModel',
  state: {
    workers: []
  },
  reducers: {
    updateList(state, action) {
      return {
        ...state,
        workers: action.payload
      }
    },
  },
  effects: {
    *searchList(action, { put, call } ) {
      try {
        const resp = yield call(GetWorkers);
        yield put({
          type: 'updateList',
          payload: resp.data,
        });
        if (action.callback) {
          action.callback();
        }
      } catch(err) {
        console.error(err);
      }
    },
  },
};
