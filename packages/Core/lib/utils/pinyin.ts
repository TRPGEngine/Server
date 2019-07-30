import pinyin from 'pinyin';
import _ from 'lodash';

/**
 * 中文文本转拼音的工具
 * @param str 中文文本
 */
export function toPinyin(str: string) {
  const py = pinyin(str, {
    heteronym: false,
    segment: false,
    style: pinyin.STYLE_NORMAL,
  });
  return _(py)
    .flatten()
    .flatten();
}
