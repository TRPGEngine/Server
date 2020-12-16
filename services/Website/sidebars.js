const wiki = require('./docs/wiki/_list.json');

module.exports = {
  docs: {
    开始: [
      'introduce',
      'quick-start',
      'chat-interceptor',
      'shortcuts',
      'recruit',
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
    自部署: ['selfhost/selfhost', 'selfhost/faq'],
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
