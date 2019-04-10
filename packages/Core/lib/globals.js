// 这里是放一些通用的方法给子模块用
const xss = require('xss');

const global = exports = module.exports = {};

global.xss = xss;
