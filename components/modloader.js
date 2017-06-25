const fs = require('fs');
const path = require('path');

let modsDirExists = fs.existsSync('mods');
if(!modsDirExists) {
  fs.mkdirSync('mods');
}

let projectPath = process.cwd();
let modsPath = `${projectPath}/mods`;

exports.load = function(cb) {
  fs.readdir(modsPath, function(err, files) {
    let modList = [];
    for (modName of files) {
      let entry = 'index.js';
      if(fs.existsSync(`${modsPath}/${modName}/package.json`)) {
        entry = require(`${modsPath}/${modName}/package.json`).main || 'index.js'
      }
      console.log(entry);
      modList.push(require(`${modsPath}/${modName}/${entry}`))
    }
    cb(modList);
  })
}
