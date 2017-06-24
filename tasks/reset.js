const fs= require('fs');
let core = require('trpg-core')();

// 创建文件夹
let dbDirExists = fs.existsSync("db");
if(!dbDirExists) {
  fs.mkdirSync("db");
}

core.db.connect(function(db) {
  db.drop(function(err) {
    if (err) throw err;

    db.sync(function (err) {
      if (err) throw err;

      core.db.init(db, function() {
        core.io.close();
      });
    });
  });
})
