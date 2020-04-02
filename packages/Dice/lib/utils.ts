import _ from 'lodash';

const isNumberStr = (str: string) => /^\d*$/.test(str);

/**
 * 在一定范围内取随机值
 * @param maxPoint 最大点数
 * @param minPoint 最小点数
 */
export function rollPoint(maxPoint: number, minPoint = 1): number {
  maxPoint = parseInt(String(maxPoint));
  minPoint = parseInt(String(minPoint));
  if (maxPoint <= 1) {
    maxPoint = 100;
  }
  if (maxPoint < minPoint) {
    maxPoint = minPoint + 1;
  }

  var range = maxPoint - minPoint + 1;
  var rand = Math.random();
  return minPoint + Math.floor(rand * range);
}

interface RollRes {
  str: string;
  value: number;
}
/**
 * 投骰
 * @param requestStr 投骰表达式 如1d100
 */
export function roll(requestStr: string): RollRes {
  const pattern = /(\d*)\s*d\s*(\d*)/gi;

  requestStr = requestStr.replace(/[^\dd\+-\/\*\(\)]+/gi, ''); //去除无效或危险字符
  const express = requestStr.replace(pattern, function(tag, num, dice) {
    num = num || 1;
    dice = dice || 100;
    const res = [];
    for (var i = 0; i < num; i++) {
      res.push(rollPoint(dice));
    }

    if (num > 1) {
      return '(' + res.join('+') + ')';
    } else {
      return res.join('+');
    }
  });

  if (_.isEmpty(requestStr) || _.isEmpty(express)) {
    throw new Error('invalid request');
  }

  const result = eval(express);
  let str = '';
  if (express !== result) {
    str = requestStr + '=' + express + '=' + result;
  } else {
    str = requestStr + '=' + result;
  }

  return {
    str,
    value: Number(result),
  };
}

interface RollJudgeRes extends RollRes {
  isHidden: boolean; // 是否为暗骰
  success: boolean; // 是否成功
  targetValue: number; // 判定目标点
  targetProps: string; //判定属性点
}
/**
 * 投掷判定骰
 * 用于coc
 * @param requestStr 投骰表达式 如a 50, a 力量
 * @param contextData 数据上下文
 */
export function rollJudge(requestStr: string, contextData: {}): RollJudgeRes {
  if (!requestStr.startsWith('a')) {
    throw new Error('不正确的表达式:' + requestStr);
  }

  const args = requestStr.split(' ');
  const params = args[0];

  let isHiddenDice = params.includes('h'); // 是否为暗骰
  let bonus = 0; // TODO: 奖励点
  let targetValue = null; // 判定目标属性
  let targetProps = ''; // 判定目标属性

  // 字符串处理
  if (args.length === 2) {
    if (isNumberStr(args[1])) {
      targetValue = Number(args[1]);
    } else {
      targetProps = args[1];
    }
  } else {
    targetProps = args[1];
    if (isNumberStr(args[2])) {
      targetValue = Number(args[2]);
    }
  }

  // 读取上下文
  if (_.isNull(targetValue)) {
    // 如果没有指定目标, 则尝试从上下文中获取数据
    const tmp = Number(_.get(contextData, [targetProps]));
    if (!isNaN(tmp)) {
      targetValue = tmp;
    }
  }

  const { str, value } = roll('1d100');

  let success: boolean;
  if (value < (targetValue ?? 50)) {
    // 成功
    success = true;
  } else {
    // 失败
    success = false;
  }

  return {
    str,
    value,
    success,
    targetValue,
    targetProps,
    isHidden: isHiddenDice,
  };
}

/**
 * 迭代投骰
 * 用于ww骰
 * @param n 投骰数
 * @param res 结果列表
 * @param rerollNum 需要重骰的点数
 */
function rollIterate(
  n: number,
  rerollNum = 10,
  res: Array<number[]> = []
): number[][] {
  const list: number[] = [];
  for (let i = 0; i < n; i++) {
    const point = rollPoint(10); // roll10
    list.push(point);
  }
  res.push(list);

  const rerollList = list.filter((i) => i >= rerollNum);
  if (rerollList.length > 0) {
    // 重骰
    rollIterate(rerollList.length, rerollNum, res);
  }

  return res;
}
/**
 * 骰ww骰
 * @param requestStr 投骰表达式 如ww5
 * @param validPoint 有效骰 默认是8
 */
const wwRE = /(\d+)(a\d+)?/;
export function rollWW(requestStr: string, validPoint = 8): RollRes {
  if (!requestStr.startsWith('ww')) {
    throw new Error('不正确的表达式:' + requestStr);
  }

  const numMatch = requestStr.match(wwRE);
  if (_.isNil(numMatch)) {
    throw new Error('不合法的表达式:' + requestStr);
  }
  const num = Number(numMatch[1]); // 初始骰数
  const rerollPoint = _.isNil(numMatch[2])
    ? undefined
    : Number(numMatch[2].substr(1)); // 重骰点数

  const rollPointList = rollIterate(num, rerollPoint);

  const value = _.flatten(rollPointList).filter((p) => p >= validPoint).length;
  const str = rollPointList
    .map((sub) => sub.join(','))
    .map((s) => `(${s})`)
    .join('+');

  return { value, str: `${str}=${value}` };
}
