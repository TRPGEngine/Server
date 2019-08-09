import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { fetchDevicesList } from './service';
import _get from 'lodash/get';

export interface StateType {
  devices: any;
}

export type Effect = (
  action: AnyAction,
  effects: EffectsCommandMap & {
    select: <T>(func: (state: StateType) => T) => T;
  }
) => void;

export interface ModelType {
  namespace: string;
  state: StateType;
  effects: {
    fetch: Effect;
  };
  reducers: {
    updateDevices: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'notifyPanel',

  state: {
    devices: [],
  },

  effects: {
    *fetch({ page = 1 }, { call, put }) {
      try {
        const response = yield call(fetchDevicesList, page);
        yield put({
          type: 'updateDevices',
          payload: _get(response, 'data.devices'),
        });
      } catch (err) {
        console.error(err);
      }
    },
  },

  reducers: {
    updateDevices(state, { payload }) {
      return {
        ...state,
        devices: payload,
      };
    },
  },
};

export default Model;
