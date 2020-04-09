module.exports = {
  docs: {
    开始: ['introduce', 'chat-interceptor'],
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
        ],
      },
      {
        type: 'link',
        href: 'https://trpg.moonrailgun.com/playground',
        label: 'Playground',
      },
    ],
  },
  develop: {
    开发: ['develop', 'config'],
    包: ['package-core'],
  },
};
