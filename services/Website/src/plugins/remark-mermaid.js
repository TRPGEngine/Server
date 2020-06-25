function transformNode(node) {
  const contents = node.value;
  return [
    {
      type: 'jsx',
      value: '<MermaidBlock>' + JSON.stringify(contents) + '</MermaidBlock>',
    },
  ];
}

const matchNode = (node) => node.type === 'code' && node.lang === 'mermaid';

const nodeForImport = {
  type: 'import',
  value: "import MermaidBlock from '@theme/MermaidBlock';",
};

module.exports = function mermaid() {
  let transformed = false;
  return function transformer(node) {
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
};
