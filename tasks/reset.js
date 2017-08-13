const fs= require('fs');
let trpg = require('../components/trpg');

// 创建文件夹
let dbDirExists = fs.existsSync("db");
if(!dbDirExists) {
  fs.mkdirSync("db");
}

trpg.run();
trpg.reset();
trpg.close();
