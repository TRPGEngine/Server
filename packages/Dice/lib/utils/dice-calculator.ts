// regexp base on https://github.com/w4123/Dice3/blob/master/src/dice_calculator.cpp
export const standardDiceRE = new RegExp(
  '(([0-9]*)d([0-9]*)(k([0-9]*))?)|((b|p)([1-3])?)',
  'i'
);
const digitalRE = /\d+/;

// 操作符优先级映射
const operatorPriorityMap = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

/**
 * 中缀表达式转后缀表达式
 * 本质上来说就是管理一个操作符栈
 * 如果是数字
 *  则直接压入结果栈
 * 如果是操作符
 *  将相对操作符栈栈顶运算符的高优先级的运算符直接压入，低优先级(或等于)的运算符将操作符栈弹出到结果栈中
 * @param rawExp 原始字符串
 */
export function infix2Suffix(rawExp: string): string[] {
  const expArr = rawExp.split('');
  const stack: string[] = []; // 结果存储栈 存储的结果为转换后的后缀表达式
  const operatorStack: string[] = []; // 操作符存储栈
  let sum = '';
  for (let i = 0; i < expArr.length; i++) {
    const c = expArr[i];

    if (digitalRE.test(c)) {
      // 是数字
      if (sum === '') {
        sum += c;
        stack.push(sum);
      } else {
        sum += c;
        stack.pop();
        stack.push(sum);
      }
    } else {
      sum = '';

      // 特殊处理括号
      if (c === ')') {
        let tmpOper = operatorStack.pop();
        while ('(' != tmpOper) {
          stack.push(tmpOper);
          tmpOper = operatorStack.pop();
        }
      } else if (c === '(') {
        operatorStack.push(c);
      }

      if (c in operatorPriorityMap) {
        const priority = operatorPriorityMap[c];
        let stackTop: string;
        do {
          if (operatorStack.length === 0) {
            // 如果栈中没有数据，则直接跳出循环压栈
            break;
          }

          stackTop = operatorStack[operatorStack.length - 1];

          if (stackTop in operatorPriorityMap) {
            const stackTopPriority = operatorPriorityMap[stackTop];
            if (priority > stackTopPriority) {
              // 如果优先级高，直接压栈
              break;
            } else {
              // 如果优先级小于等于栈顶操作符优先级，则将栈顶操作符弹出到结果栈中
              stack.push(operatorStack.pop());
            }
          } else {
            // 不在map中直接跳出
            break;
          }
        } while (operatorStack.length > 0 && stackTop !== '(');
        operatorStack.push(c);
      }
    }
  }

  // 倒序压入剩余操作符
  stack.push(...operatorStack.reverse());

  return stack;
}

/**
 * 计算投骰表达式
 * 基于逆波兰表达式来实现计算功能
 * 不支持带小数点的操作
 * @param expression 投骰表达式
 */
export function calDiceExpression(expression: string): number {
  const suffixExp = infix2Suffix(expression);
  const stack: number[] = [];

  for (let i = 0; i < suffixExp.length; i++) {
    const item = suffixExp[i];
    if (digitalRE.test(item)) {
      // 是数字, 压入栈
      stack.push(Number(item));
    } else {
      // 不是数字，处理
      const right = stack.pop();
      const left = stack.pop();

      switch (item) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          stack.push(left / right);
          break;
      }
    }
  }

  return stack[0];
}
