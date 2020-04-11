/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const siteConfig = {
  title: 'TRPG Engine',
  tagline: '为跑团而生的即时通讯应用',
  url: 'https://trpg.moonrailgun.com',
  baseUrl: '/',
  projectName: 'Server',
  organizationName: 'TRPGEngine',

  themeConfig: {
    navbar: {
      title: 'TRPG Engine',
      logo: {
        alt: 'TRPGEngine Logo',
        src: 'img/trpg_logo.png',
      },
      links: [
        { to: 'docs/introduce', label: '文档', position: 'left' },
        // { to: 'docs/develop', label: '开发', position: 'left' },
        // { to: 'help', label: '帮助', position: 'left' },
        { to: 'blog', label: '博客', position: 'right' },
        {
          href: 'https://github.com/orgs/TRPGEngine/',
          label: 'Github',
          position: 'right',
        },
        { languages: false },
        { search: false },
        {
          href: 'http://moonrailgun.com',
          label: '关于作者',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'TRPGEngine Logo',
        src: 'img/trpg_logo.png',
      },
      copyright: `Copyright © ${new Date().getFullYear()} moonrailgun`,
      ogImage: 'img/trpg_logo.png',
      twitterImage: 'img/trpg_logo.png',
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '普通用户',
              to: 'docs/introduce',
            },
            {
              label: '开发者',
              to: 'docs/develop',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'TRPG Engine 网页版',
              href: 'https://trpg.moonrailgun.com',
            },
            {
              label: 'TRPGEngine博客',
              to: 'blog',
            },
            {
              label: 'Github',
              to: 'https://github.com/TRPGEngine',
            },
            {
              label: '开发者博客',
              href: 'http://moonrailgun.com',
            },
          ],
        },
      ],
    },
    googleAnalytics: {
      trackingID: 'UA-121610011-2',
    },
  },

  favicon: 'img/favicon.ico',

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    // 'https://buttons.github.io/buttons.js'
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // docs folder path relative to website dir.
          path: '../docs',
          // sidebars file relative to website dir.
          sidebarPath: require.resolve('./sidebars'),
          remarkPlugins: [require('./src/plugins/remark-template-previewer')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: true,
      },
    ],
  ],
};

module.exports = siteConfig;
