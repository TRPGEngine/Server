const Sequelize = require('sequelize');
const transaction = require('orm-transaction');
const path = require('path');
const fs = require('fs');
const process = require('process');
const debug = require('debug')('trpg:storage');
const debugSQL = require('debug')('trpg:storage:sql');
const appLogger = require('./logger')('application');
const _set = require('lodash/set');

module.exports = Storage;

const defaultDbOptions = {
  logging(sql) {
    debugSQL(sql);
  },
  timezone: '+08:00',
  define: {
    freezeTableName: true, // 默认sequelize会在数据库表名后自动加上s, 改为true使其不会进行自动添加
  }
}

function Storage(dbconfig) {
  if (!(this instanceof Storage)) return new Storage(dbconfig);

  this.db = this.initDb(dbconfig);
  this._Sequelize = Sequelize;
  this.Op = Sequelize.Op;
  this.models = [];

  redefineDb(this.db);
}

// 重定义orm db实例的部分行为
function redefineDb(db) {
  db.op = Sequelize.Op;
  db.transactionAsync = async (fn) => {
    // TODO: 需要实现一个自动传递transaction的事务方法
    if(fn) {
      return await fn()
    }

    return;
  }

  let originDefine = db.define;
  db.define = function(name, attributes, options) {
    // 增加required
    for (let field in attributes) {
      let attr = attributes[field];
      if(attr.required === true) {
        _set(attr, 'allowNull', false);
      }
    }

    // 增加类方法别名，使用闭包防止访问到不正确的对象
    originModelCls = originDefine.call(db, name, attributes, options);
    originModelCls.oneAsync = (function(_) {
      return function(where) {
        return _.findOne({where});
      }
    })(originModelCls)
    originModelCls.createAsync = originModelCls.create;
    originModelCls.getAsync = originModelCls.findByPk;
    originModelCls.prototype.saveAsync = originModelCls.prototype.save;
    originModelCls.prototype.removeAsync = originModelCls.prototype.destroy;

    // 增加methods
    if(options && options.methods) {
      for (let methodName in options.methods) {
        originModelCls.prototype[methodName] = options.methods[methodName];
      }
    }

    return originModelCls
  }
}

// 返回一个db实例
Storage.prototype.initDb = function(dbconfig) {
  let db;
  if(typeof dbconfig === 'string') {
    db = new Sequelize(dbconfig)
  }else {
    let {
      database,
      username,
      password,
      options,
    } = dbconfig;

    options = Object.assign({}, defaultDbOptions, options);
    db = new Sequelize(database, username, password, options);
  }

  return db;
}

Storage.prototype.test = function() {
  this.db.authenticate()
    .then(() => {
      console.log('连接测试成功.');
    }).catch(err => {
      console.error('无法连接到数据库:', err);
    });
}
// Storage.prototype.getModels = function(db, cb) {
//   try {
//     db.settings.set('instance.returnAllErrors', true);
//     db.use(transaction);
//
//     for (model of this.models) {
//       model(orm, db);
//     }
//
//     // cb(null, db);
//     return db;
//   } catch (e) {
//     // cb(e);
//     throw new Error(e);
//   }
// }
// Storage.prototype.connect = function(cb) {
//   let storage = this;
//   orm.connect(storage.dirverUrl, function(err, db) {
//     if (err) throw new Error('Connection error: ' + err);
//
//     cb(storage.getModels(db));
//   });
// }
// Storage.prototype.connectAsync = async function() {
//   let storage = this;
//   let db;
//   try {
//     db = await orm.connectAsync(storage.dirverUrl);
//     db = storage.getModels(db);
//   }catch(e) {
//     throw new Error(e);
//   }
//
//   return db;
// }
Storage.prototype.registerModel = function(modelFn) {
  if(typeof modelFn != 'function') {
    throw new TypeError(`registerModel error: type of model must be Function not ${typeof model}`);
  }

  debug('register model %o success!', modelFn);
  appLogger.info('register model %o success!', modelFn);
  const model = modelFn(this._Sequelize, this.db);
  this.models.push(model);
}

Storage.prototype.reset = function(force = false) {
  // if(this.type === 'file') {
  //   let filepath = path.resolve(process.cwd(), './db/');
  //   // 创建文件夹
  //   let dbDirExists = fs.existsSync(filepath);
  //   if(!dbDirExists) {
  //     fs.mkdirSync(filepath);
  //   }
  // }
  //
  // this.connect(function(db) {
  //   db.drop(function(err) {
  //     if (err) throw err;
  //
  //     db.sync(function (err) {
  //       if (err) throw err;
  //
  //       cb(db);
  //     });
  //   });
  // })
  return this.db.sync({force});
}

Storage.prototype.resetAsync = async function(cb) {
  if(this.type === 'file') {
    let filepath = path.resolve(process.cwd(), './db/');
    // 创建文件夹
    let dbDirExists = fs.existsSync(filepath);
    if(!dbDirExists) {
      fs.mkdirSync(filepath);
    }
  }

  try {
    const db = await this.connectAsync();
    console.log('is dropping db...');
    await db.dropAsync();
    console.log('is recreate db...');
    await db.syncPromise();
    console.log('start reset module db...');
    await cb(db);
    console.log('reset completed!');
  } catch(err) {
    console.error('reset error:');
    console.error(err);
    process.exit(1);
  }
}

Storage.prototype.syncAsync = async function() {
  if(this.type === 'file') {
    let filepath = path.resolve(process.cwd(), './db/');
    // 创建文件夹
    let dbDirExists = fs.existsSync(filepath);
    if(!dbDirExists) {
      fs.mkdirSync(filepath);
    }
  }

  try {
    const db = await this.connectAsync();
    console.log('is sync db...');
    await db.syncPromise();
    console.log('sync completed!');
  } catch(err) {
    console.error('reset error:');
    console.error(err);
    process.exit(1);
  }
}

/*
db.driver.execQuery("SELECT id, email FROM user", function (err, data) { ... })
// 上面是直接执行SQL，下面是类似参数化。   列用??表示, 列值用?表示。   建议使用下面这种
db.driver.execQuery(
  "SELECT user.??, user.?? FROM user WHERE user.?? LIKE ? AND user.?? > ?",
  ['id', 'name', 'name', 'john', 'id', 55],
  function (err, data) { ... }
)
*/
Storage.prototype.query = function(sql, params, cb) {
  this.connect(function(db) {
    db.driver.execQuery(sql, params, cb);
  });
}

// return Promise
Storage.prototype.close = function() {
  return this.db.close();
}
