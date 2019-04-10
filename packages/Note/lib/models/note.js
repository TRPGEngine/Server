const striptags = require('striptags');

module.exports = function Note(Sequelize, db) {
  let Note = db.define(
    'note_note',
    {
      uuid: { type: Sequelize.UUID, required: true },
      title: { type: Sequelize.STRING, required: true },
      content: { type: Sequelize.TEXT },
    },
    {
      hooks: {},
      methods: {
        getCoverImage: function() {
          let content = this.content;
          let imgIndex = content.indexOf('<img');
          if (imgIndex >= 0) {
            let match = content.match(/<img.*?src="(.*?)".*?>/);
            if (match && match[1]) {
              return match[1];
            }
          }

          return null;
        },
        getSummary: function() {
          let content = this.content;
          let summary = striptags(content) || '';
          summary = summary.substr(0, 100).trim() + '...'; // 长度100
          return summary;
        },
      },
    }
  );

  let User = db.models.player_user;
  if (!!User) {
    Note.belongsTo(User, {
      foreignKey: 'ownerId',
      as: 'owner',
    });
    User.hasOne(Note, {
      foreignKey: 'ownerId',
      as: 'notes',
    });
  }

  return Note;
};
