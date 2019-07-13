import pinyin from 'pinyin';
import _ from 'lodash';

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
