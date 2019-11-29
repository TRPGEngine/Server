/**
 * 简单测试一个标准应用需要的启动用时
 */

console.log('应用启动中...');

const startTime = new Date().valueOf();

const app = require('../../');

const endTime = new Date().valueOf();

console.log(`同步启动用时: ${endTime - startTime} ms`);
