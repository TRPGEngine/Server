'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "ownerId" to table "chat_emotion_item"
 *
 **/

var info = {
    "revision": 8,
    "name": "addEmotionItemOwner",
    "created": "2019-06-08T15:38:17.125Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "chat_emotion_item",
        "ownerId",
        {
            "type": Sequelize.INTEGER,
            "field": "ownerId",
            "onUpdate": "CASCADE",
            "onDelete": "SET NULL",
            "references": {
                "model": "player_user",
                "key": "id"
            },
            "allowNull": true
        }
    ]
}];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
