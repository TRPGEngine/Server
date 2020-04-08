/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

const Container = (props) => <div>{props.children}</div>;
const GridBlock = (props) => <div>{props.children}</div>;

function Help(props) {
  const { config: siteConfig, language = '' } = props;
  const { baseUrl, docsUrl } = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;
  const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

  const supportLinks = [
    {
      content: `查询 [文档](${docUrl('introduce.html')}) 来了解更多`,
      title: '浏览文档',
    },
    {
      content: 'QQ群: 892133280 欢迎你的加入, 不论你是什么规则的玩家',
      title: '加入社群',
    },
    {
      content: '时刻保证自己本地的客户端处于最新版本',
      title: '保存最新',
    },
  ];

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>需要帮助?</h1>
          </header>
          <p>
            这个项目由{' '}
            <a href="https://github.com/moonrailgun" target="_blank">
              moonrailgun
            </a>{' '}
            维护.
          </p>
          <GridBlock contents={supportLinks} layout="threeColumn" />
        </div>
      </Container>
    </div>
  );
}

export default Help;
