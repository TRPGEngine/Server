'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "chat_emotion_catalog", deps: [player_user]
 * createTable "chat_emotion_usermap_catalog", deps: [chat_emotion_catalog, player_user]
 * createTable "chat_emotion_item", deps: [chat_emotion_catalog, file_file]
 * createTable "chat_emotion_usermap_item", deps: [chat_emotion_item, player_user]
 *
 **/

var info = {
    "revision": 5,
    "name": "emotion",
    "created": "2019-06-06T07:49:29.109Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "chat_emotion_catalog",
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
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
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
                "ownerId": {
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
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "chat_emotion_usermap_catalog",
            {
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
                "ChatEmotionCatalogId": {
                    "type": Sequelize.INTEGER,
                    "field": "ChatEmotionCatalogId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "chat_emotion_catalog",
                        "key": "id"
                    },
                    "primaryKey": true
                },
                "playerUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "playerUserId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "chat_emotion_item",
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
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false,
                    "required": true
                },
                "url": {
                    "type": Sequelize.STRING,
                    "field": "url",
                    "allowNull": false,
                    "required": true
                },
                "width": {
                    "type": Sequelize.INTEGER,
                    "field": "width"
                },
                "height": {
                    "type": Sequelize.INTEGER,
                    "field": "height"
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
                "fileId": {
                    "type": Sequelize.INTEGER,
                    "field": "fileId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "file_file",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "chat_emotion_usermap_item",
            {
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
                "ChatEmotionItemId": {
                    "type": Sequelize.INTEGER,
                    "field": "ChatEmotionItemId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "chat_emotion_item",
                        "key": "id"
                    },
                    "primaryKey": true
                },
                "playerUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "playerUserId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                }
            },
            {}
        ]
    }
];

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
