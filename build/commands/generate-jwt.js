const { getBinPath, exec } = require('./utils');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('config');
const inquirer = require('inquirer');

const jwtIssuer = 'trpg';

exports.command = 'generate-jwt';
exports.desc = 'generate a db migrate';
exports.builder = function(args) {
  return args.usage('$0 generate-jwt').argv;
};
exports.handler = async function(argv) {
  const secret = _.get(config, 'jwt.secret');
  console.log('secret:', secret);
  const { uuid } = await inquirer.prompt({
    type: 'input',
    name: 'uuid',
  });

  const token = jwt.sign(
    {
      uuid: uuid,
      name: `cli-generator#${uuid}`,
      avatar: `cli-generator#${uuid}`,
    },
    secret,
    {
      expiresIn: '1d',
      issuer: jwtIssuer,
    }
  );
  console.log('================Result:');
  console.log('Generate JWT:\n\t', token);
  console.log('----------------');
  console.log('Set in browser:\n\t', `localStorage.setItem("jwt", "${token}")`);
};
