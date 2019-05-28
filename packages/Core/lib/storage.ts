import SequelizeStatic, {
  Sequelize,
  Options,
  Op,
  Model,
  ModelOptions,
  DataType,
  ModelAttributeColumnOptions,
} from 'sequelize';
// const transaction = require('orm-transaction'); // TODO
import Debug from 'debug';
const debug = Debug('trpg:storage');
const debugSQL = Debug('trpg:storage:sql');
import { ModelFn } from 'trpg/core';

import { getLogger } from './logger';
const appLogger = getLogger('application');
import _set from 'lodash/set';

export type ModelFn = (
  Sequelize: typeof SequelizeStatic,
  db: DBInstance
) => Model;

export interface TRPGDbOptions {
  database: string;
  username: string;
  password: string;
  options: Options;
}

interface TRPGModelAttributes {
  [name: string]:
    | DataType
    | (ModelAttributeColumnOptions & {
        required?: true;
      });
}
// 魔改一下db的类型，加入了一些自己的参数
export type DBInstance = Sequelize & {
  op?: typeof Op;
  transactionAsync?: any;
  define: (
    modelName: string,
    attributes: TRPGModelAttributes,
    options?: ModelOptions
  ) => typeof Model;
};

const defaultDbOptions: Options = {
  logging(sql) {
    debugSQL(sql);
  },
  timezone: '+08:00',
  define: {
    freezeTableName: true, // 默认sequelize会在数据库表名后自动加上s, 改为true使其不会进行自动添加
  },
};

export default class Storage {
  db: DBInstance;
  _Sequelize = SequelizeStatic;
  Op = Op;
  models = [];

  constructor(dbconfig: TRPGDbOptions) {
    this.db = this.initDb(dbconfig);

    redefineDb(this.db);
  }

  // 初始化并返回一个db实例
  initDb(dbconfig: TRPGDbOptions) {
    let db: Sequelize;
    if (typeof dbconfig === 'string') {
      db = new Sequelize(dbconfig);
    } else {
      let { database, username, password, options } = dbconfig;

      options = Object.assign({}, defaultDbOptions, options);
      db = new Sequelize(database, username, password, options);
    }

    return db;
  }

  test() {
    this.db
      .authenticate()
      .then(() => {
        console.log('连接测试成功.');
      })
      .catch((err) => {
        console.error('无法连接到数据库:', err);
      });
  }

  // 注册模型
  registerModel(modelFn: ModelFn): Model {
    if (typeof modelFn != 'function') {
      throw new TypeError(
        `registerModel error: type of model must be Function not ${typeof modelFn}`
      );
    }

    debug('register model %o success!', modelFn);
    appLogger.info('register model %o success!', modelFn);
    const model = modelFn(this._Sequelize, this.db);
    this.models.push(model);
    return model;
  }

  reset(force = false) {
    return this.db.sync({ force });
  }

  query(sql: string) {
    return this.db.query(sql);
  }

  close() {
    return this.db.close();
  }
}

// 重定义orm db实例的部分行为
function redefineDb(db: DBInstance) {
  db.op = Op;
  db.transactionAsync = async (fn) => {
    // TODO: 需要实现一个自动传递transaction的事务方法
    if (fn) {
      return await fn();
    }

    return;
  };

  let originDefine = db.define;
  db.define = function(name, attributes, options) {
    // 增加required
    for (let field in attributes) {
      let attr = attributes[field];
      if (attr.required === true) {
        _set(attr, 'allowNull', false);
      }
    }

    // 增加类方法别名，使用闭包防止访问到不正确的对象
    let originModelCls = originDefine.call(db, name, attributes, options);
    originModelCls.oneAsync = (function(_) {
      return function(where) {
        return _.findOne({ where });
      };
    })(originModelCls);
    originModelCls.createAsync = originModelCls.create;
    originModelCls.getAsync = originModelCls.findByPk;
    originModelCls.prototype.saveAsync = originModelCls.prototype.save;
    originModelCls.prototype.removeAsync = originModelCls.prototype.destroy;

    // 增加methods
    if (options && options.methods) {
      for (let methodName in options.methods) {
        originModelCls.prototype[methodName] = options.methods[methodName];
      }
    }

    return originModelCls;
  };
}
