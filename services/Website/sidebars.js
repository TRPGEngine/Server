const wiki = require('./docs/wiki/_list.json');

module.exports = {
  docs: {
    开始: [
      'introduce',
      'quick-start',
      'chat-interceptor',
      'shortcuts',
      'recruit',
      'mobile',
      'richeditor-crash',
    ],
    人物: [
      'actor/actor1',
      'actor/actor2',
      {
        标签: [
          'actor/tags/template',
          'actor/tags/row',
          'actor/tags/col',
          'actor/tags/baseinfo',
          'actor/tags/baseattr',
          'actor/tags/tabs',
          'actor/tags/select',
          'actor/tags/datatable',
          'actor/tags/divider',
          'actor/tags/bar',
          'actor/tags/space',
        ],
      },
      'actor/reserved-word',
      {
        type: 'link',
        href: 'https://trpg.moonrailgun.com/playground',
        label: 'Playground',
      },
    ],
    扮演: ['roleplay/alignment'],
    机器人: ['robot/coc7'],
    自部署: ['selfhost/selfhost', 'selfhost/faq'],
    第三方接入: ['develop/oauth/create', 'develop/oauth/usage'],
  },
  develop: {
    开发: [
      'develop/introduce',
      'develop/config',
      {
        架构: ['develop/structure/socket-communicate'],
      },
    ],
    包: ['develop/packages/core'],
  },
  wiki: ['wiki/index', ...wiki],
};
