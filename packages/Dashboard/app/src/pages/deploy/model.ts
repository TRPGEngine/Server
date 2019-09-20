import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { fetchDeployList } from './service';
import _get from 'lodash/get';
import { DeployVersionType } from './data';

export interface StateType {
  deploys: DeployVersionType[];
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
    updateDeploy: Reducer<StateType>;
  };
}

const Model: ModelType = {
  namespace: 'deployPanel',

  state: {
    deploys: [],
  },

  effects: {
    *fetch({ page = 1 }, { call, put }) {
      const response = yield call(fetchDeployList, page, 100);
      yield put({
        type: 'updateDeploy',
        payload: _get(response, 'data.deploys'),
      });
    },
  },

  reducers: {
    updateDeploy(state, { payload }) {
      return {
        ...state,
        deploys: payload,
      };
    },
  },
};

export default Model;
