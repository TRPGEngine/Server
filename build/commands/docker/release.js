const { getBinPath, exec, getVersion, getProjectPath } = require('../utils');
const inquirer = require('inquirer');

exports.command = 'release';
exports.desc = 'Release docker image';
exports.builder = {
  dir: {
    default: getProjectPath('.'),
  },
};
exports.handler = async function (argv) {
  const version = getVersion();

  const { username, options } = await inquirer.prompt([
    {
      name: 'username',
      message: '请输入当前登录的docker仓库用户名',
      default: 'moonrailgun',
    },
    {
      name: 'options',
      type: 'checkbox',
      choices: [
        {
          name: '归档版本',
          value: 'isArchive',
        },
      ],
    },
  ]);

  const tagName = `${username}/trpg-server`;
  console.log('开始构建镜像:', tagName);
  await exec('docker', ['build', '.', '--tag', tagName], {
    cwd: getProjectPath('.'),
  });

  if (options.includes('isArchive')) {
    console.log('正在生成', `${tagName}:${version}`);
    await exec('docker', ['tag', tagName, `${tagName}:${version}`], {
      cwd: getProjectPath('.'),
    });
  }

  console.log('==================');
  console.log('生成完毕');
  console.log(`docker push ${tagName}`);
  if (options.includes('isArchive')) {
    console.log(`docker push ${tagName}:${version}`);
  }
};
