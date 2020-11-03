const { getBinPath, exec, getVersion, getProjectPath } = require('../utils');
const inquirer = require('inquirer')

exports.command = 'release';
exports.desc = 'Release docker image';
exports.builder = {
  dir: {
    default: getProjectPath('.'),
  },
};
exports.handler = async function (argv) {
  const version = getVersion();

  const {username} = await inquirer.prompt([{
    name: 'username',
    message: '请输入当前登录的docker仓库用户名',
    default: 'moonrailgun'
  }])

  const tagName = `${username}/trpg-server:${version}`

  console.log(`开始构建镜像: ${tagName}`)
  exec('docker', ['build', '.', '--tag', tagName], {
    cwd: getProjectPath('.'),
  });
};
