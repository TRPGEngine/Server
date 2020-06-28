import React, { useEffect, useRef } from 'react';
import uuid from 'uuid/v1';

// http://mermaid-js.github.io/mermaid/#/usage?id=api-usage
function MermaidBlock(props) {
  const content = props.children;
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    try {
      (window as any).mermaid?.mermaidAPI.render(
        'graphDiv-' + uuid(),
        JSON.parse(content),
        (svg, bindFunctions) => {
          containerRef.current.innerHTML = svg;
          bindFunctions(containerRef.current);
        }
      );
    } catch (e) {
      console.error('[MermaidBlock]解析错误' + e);
    }
  }, [content]);

  return <div ref={containerRef} />;
}

export default MermaidBlock;
