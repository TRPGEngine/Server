/**
 * 参考自: https://github.com/facebook/docusaurus/blob/master/website/src/plugins/remark-npm2yarn.js
 */
const LZString = require('lz-string');

const transformNode = (node) => {
  const xml = node.value;
  let fullXML = xml
  if(fullXML.indexOf('<Template>') === -1) {
    // 没有被template包裹
    fullXML = `<?xml version="1.0" encoding="utf-8" ?><Template>${xml}</Template>`
  }
  const hash = `#code/${LZString.compressToEncodedURIComponent(fullXML)}`;
  const previewerUrl = `https://trpg.moonrailgun.com/playground/preview/${hash}`;
  return [
    {
      type: 'jsx',
      value: `<Tabs defaultValue="code" values={[
    { label: '布局', value: 'code', },
    { label: '预览', value: 'previewer', },
  ]}
>
<TabItem value="code">`,
    },
    {
      type: node.type,
      lang: node.lang,
      value: xml,
    },
    {
      type: 'jsx',
      value: '</TabItem>\n<TabItem value="previewer">',
    },
    {
      type: 'jsx',
      value: `<iframe width="100%" height="300" src="${previewerUrl}" />`,
    },
    {
      type: 'jsx',
      value: '</TabItem>\n</Tabs>',
    },
  ];
};

const matchNode = (node) =>
  node.type === 'code' && node.meta === 'layoutTemplate';
const nodeForImport = {
  type: 'import',
  value:
    "import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';",
};

module.exports = () => {
  let transformed = false;
  const transformer = (node) => {
    if (matchNode(node)) {
      transformed = true;
      return transformNode(node);
    }
    if (Array.isArray(node.children)) {
      let index = 0;
      while (index < node.children.length) {
        const result = transformer(node.children[index]);
        if (result) {
          node.children.splice(index, 1, ...result);
          index += result.length;
        } else {
          index += 1;
        }
      }
    }
    if (node.type === 'root' && transformed) {
      node.children.unshift(nodeForImport);
    }
    return null;
  };
  return transformer;
};
