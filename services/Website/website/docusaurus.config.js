/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const RemarkablePlugins = require('./core/RemarkablePlugins');

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/image.jpg'.
    image: '/img/undraw_open_source.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'TRPG Engine',
  tagline: '为跑团而生的即时通讯应用',
  url: 'https://trpg.moonrailgun.com', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'Server',
  organizationName: 'TRPGEngine',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  themeConfig: {
    navbar: {
      title: 'TRPG Engine',
      logo: {
        alt: 'TRPGEngine Logo',
        src: 'img/trpg_logo.png',
      },
      links: [
        { to: 'docs/introduce', label: '文档', position: 'left' },
        { to: 'develop/develop', label: '开发', position: 'left' },
        { to: 'help', label: '帮助', position: 'left' },
        { to: 'blog', label: '博客', position: 'left' },
        {
          href: 'https://github.com/orgs/TRPGEngine/',
          label: 'Github',
          position: 'left',
        },
        { languages: false },
        { search: false },
        { href: 'http://moonrailgun.com', label: '关于作者', position: 'left' },
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
    },
  },

  // users,

  favicon: 'img/favicon.ico',

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    // 'https://buttons.github.io/buttons.js'
  ],

  // markdownPlugins: [RemarkablePlugins.ActorTemplatePreviewer], // TODO

  // repoUrl: 'https://github.com/TRPGEngine/Client',

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // docs folder path relative to website dir.
          path: '../docs',
          // sidebars file relative to website dir.
          sidebarPath: require.resolve('./sidebars.json'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};

module.exports = siteConfig;
