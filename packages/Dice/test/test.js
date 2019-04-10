const app = require('../../Core/')();
const dice = require('../');

app.load(dice);
app.run();
console.time('计算耗时');
console.log(app.dice.roll("1d100+2d6"));
console.log(app.dice.roll("d+d100+2d6-10d10"));
console.log(app.dice.roll("d+ d 100 + 2  d 6-10"));
console.timeEnd('计算耗时');
