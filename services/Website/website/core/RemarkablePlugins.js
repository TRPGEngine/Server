/**
 * 参考自: https://github.com/facebook/react-native-website/blob/f24733a4277048ea4fb36ee49d243cb1e18dc43c/website/core/RemarkablePlugins.js
 */

const LZString = require('lz-string');
const hljs = require('highlight.js');
const React = require('react');
const useState = React.useState;

function cleanParams(params) {
  if (params && params.split(' ').length > 0) {
    return params.split(' ')[1];
  }

  return null;
}

function parseParams(paramString) {
  var params = {};

  if (paramString) {
    var pairs = paramString.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      params[pair[0]] = pair[1];
    }
  }

  if (!params.platform) {
    params.platform = 'web';
  }

  return params;
}

/**
 * parse to xml
 */
function htmlForCodeBlock(code) {
  return (
    '<pre><code class="hljs css xml">' +
    hljs.highlight('xml', code).value +
    '</code></pre>'
  );
}

/**
 * Use the Previewer by including a ```ActorTemplatePreviewer``` block in
 * markdown.
 *
 * E.g.
 * ```ActorTemplatePreviewer
 * <?xml version="1.0" encoding="utf-8" ?>
 * <Template>
 *   <BaseInfo />
 *   <BaseAttr>
 *     <TextArea
 *       label="人物卡信息"
 *       name="data"
 *       :autosize="{ minRows: 4, maxRows: 8 }"
 *     />
 *   </BaseAttr>
 * </Template>
 * ```
 */
function ActorTemplatePreviewer(md) {
  md.renderer.rules.fence_custom.ActorTemplatePreviewer = function(
    tokens,
    idx,
    options,
    env,
    self
  ) {
    const sampleCode = tokens[idx].content;
    let hash = `#code/${LZString.compressToEncodedURIComponent(sampleCode)}`;

    // const paramsString = cleanParams(tokens[idx].params);
    // const params = parseParams(paramsString);

    return (
      '<div class="actor-template-previewer">' +
      htmlForCodeBlock(sampleCode) +
      '<div class="actor-template-previewer-btn">' +
      `<a class="button" href="http://127.0.0.1:8191/playground/preview/${hash}" target="_blank">预览</a>` +
      '</div>' +
      '</div>' +
      '\n\n'
    );
  };
}

module.exports = { ActorTemplatePreviewer };
