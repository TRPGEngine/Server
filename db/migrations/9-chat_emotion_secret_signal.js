'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "chat_emotion_secret_signal", deps: [chat_emotion_catalog, player_user]
 *
 **/

var info = {
    "revision": 9,
    "name": "chat_emotion_secret_signal",
    "created": "2019-06-13T12:28:31.241Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "chat_emotion_secret_signal",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "uuid": {
                "type": Sequelize.UUID,
                "field": "uuid",
                "allowNull": false,
                "defaultValue": Sequelize.UUIDV1,
                "required": true
            },
            "code": {
                "type": Sequelize.STRING,
                "field": "code",
                "allowNull": false,
                "required": true
            },
            "createdAt": {
                "type": Sequelize.DATE,
                "field": "createdAt",
                "allowNull": false
            },
            "updatedAt": {
                "type": Sequelize.DATE,
                "field": "updatedAt",
                "allowNull": false
            },
            "catalogId": {
                "type": Sequelize.INTEGER,
                "field": "catalogId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "chat_emotion_catalog",
                    "key": "id"
                },
                "allowNull": true
            },
            "creatorId": {
                "type": Sequelize.INTEGER,
                "field": "creatorId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "player_user",
                    "key": "id"
                },
                "allowNull": true
            }
        },
        {}
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
