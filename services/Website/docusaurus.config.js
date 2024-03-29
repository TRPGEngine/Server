/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const copyright = `Copyright © 2017 - ${new Date().getFullYear()} moonrailgun`;

const posthogApikey = process.env.POSTHOG_API; // posthog 的key

// 用于内部渲染的用户
const users = [
  {
    name: 'moonrailgun',
    desc: 'TRPG Engine 项目负责人',
    url: 'http://moonrailgun.com/',
    imageUrl: 'img/moonrailgun.png',
  },
];

// 插件
const plugins = [[
  '@docusaurus/plugin-pwa',
  {
    debug: true,
    offlineModeActivationStrategies: ['appInstalled', 'queryString'],
    pwaHead: [
      {
        tagName: 'link',
        rel: 'icon',
        href: '/img/trpg_logo.png',
      },
      {
        tagName: 'link',
        rel: 'manifest',
        href: '/manifest.json', // your PWA manifest
      },
      {
        tagName: 'meta',
        name: 'theme-color',
        content: '#8C6244',
      },
    ],
    // swCustom: undefined
  },
],]

if(typeof posthogApikey === 'string') {
  plugins.push('posthog-docusaurus')
}

const siteConfig = {
  title: 'TRPG Engine',
  tagline: '为跑团而生的即时通讯应用',
  url: 'https://trpgdoc.moonrailgun.com',
  baseUrl: '/',
  projectName: 'Server',
  organizationName: 'TRPGEngine',

  // 自定义内部使用的字段
  customFields: {
    users,
  },

  themeConfig: {
    // announcementBar: {
    //   id: 'support_us', // Any value that will identify this message
    //   content:
    //     '如果觉得 TRPG Engine 还不错, 或者有什么好的建议或意见反馈, 加入QQ群: 892133280',
    //   backgroundColor: '#fafbfc', // Defaults to `#fff`
    //   textColor: '#091E42', // Defaults to `#000`
    // },
    navbar: {
      title: 'TRPG Engine',
      logo: {
        alt: 'TRPGEngine Logo',
        src: 'img/trpg_logo.png',
      },
      items: [
        { to: 'docs/introduce', label: '文档', position: 'left' },
        // { to: 'docs/develop', label: '开发', position: 'left' },
        // { to: 'help', label: '帮助', position: 'left' },
        { to: 'blog', label: '博客', position: 'left' },
        { to: 'docs/wiki/index', label: 'Wiki', position: 'left' },
        {
          href: 'https://trpg.moonrailgun.com/portal/help/txc',
          label: '反馈中心',
          position: 'right',
        },
        {
          href: 'https://stats.uptimerobot.com/zqDOKHRGKK',
          label: '服务状态',
          position: 'right',
        },
        { languages: false },
        { search: true },
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
      copyright,
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
              label: 'Wiki',
              to: 'docs/wiki/index',
            },
            // {
            //   label: '开发者',
            //   to: 'docs/develop',
            // },
          ],
        },
        {
          title: '沟通',
          items: [
            {
              label: 'QQ群: 387587760',
              // href:
              //   '//shang.qq.com/wpa/qunwpa?idkey=7be5cfe70436a65c965ae9c86d9e6cfc36c16258634a42897724dce026accf3d',
              href:
                'https://shang.qq.com/wpa/qunwpa?idkey=7be5cfe70436a65c965ae9c86d9e6cfc36c16258634a42897724dce026accf3d',
            },
            {
              label: '反馈中心',
              href:
                'https://trpg.moonrailgun.com/portal/help/txc',
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
              label: 'TRPG Engine 博客',
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
    algolia: {
      appId: 'CY6SMUG8MA',
      apiKey: 'de1d3c9a1d40b6a50984a1424c2e4493',
      indexName: 'moonrailgun_trpgdoc',
      algoliaOptions: {}, // Optional, if provided by Algolia
    },
    posthog: {
      apiKey: posthogApikey,
      appUrl: 'https://app.posthog.com',
      enableInDevelopment: false,
    },
  },

  favicon: 'img/favicon.ico',

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    // 'https://buttons.github.io/buttons.js',
    'https://static7.moonrailgun.com/js/mermaid-8.5.2.min.js',
  ],

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // docs folder path relative to website dir.
          path: './docs',
          // sidebars file relative to website dir.
          sidebarPath: require.resolve('./sidebars'),
          remarkPlugins: [
            require('./src/plugins/remark-template-previewer'),
            require('./src/plugins/remark-mermaid'),
          ],
        },
        blog: {
          feedOptions: {
            type: 'all',
            title: 'TRPG Engine Blog',
            copyright,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: true,
      },
    ],
  ],

  plugins,
};

module.exports = siteConfig;
