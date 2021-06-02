import _ from 'lodash';

/**
 * NOTICE: 开发中, 暂时未投入使用
 */

// regexp base on https://github.com/w4123/Dice3/blob/master/src/dice_r_module.cpp
const matchRE = new RegExp(
  '^[\\s]*[\\.。．][\\s]*r(h)?[\\s]*(([0-9]+)#)?([0-9dk+\\-*x×÷/\\(\\)\\^bp\\.]*)[\\s]*([^]*)$',
  'i'
);

export function processRoll(rawStr: string) {
  const matchs = rawStr.match(matchRE);
  // console.log('matchs', matchs);
  if (_.isArray(matchs)) {
    // TODO: #前的操作待实现
    // let rollCount = 1;

    let dice = matchs[4];
    if (_.isEmpty(dice)) {
      dice = 'd';
    }
  }
}
