import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@theme/MDXComponents';

function MarkdownBlock(props) {
  return <MDXProvider components={MDXComponents}>{props.children}</MDXProvider>;
}

export default MarkdownBlock;
