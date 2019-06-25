'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "ChatEmotionItemId" from table "chat_emotion_usermap_item"
 * removeColumn "ChatEmotionCatalogId" from table "chat_emotion_usermap_catalog"
 * createTable "core_metrics", deps: []
 * addColumn "chatEmotionItemId" to table "chat_emotion_usermap_item"
 * addColumn "chatEmotionCatalogId" to table "chat_emotion_usermap_catalog"
 *
 **/

var info = {
    "revision": 11,
    "name": "core_metrics",
    "created": "2019-06-25T02:23:44.614Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "core_metrics",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false,
                    "required": true
                },
                "date": {
                    "type": Sequelize.DATEONLY,
                    "field": "date",
                    "allowNull": false,
                    "required": true
                },
                "type": {
                    "type": Sequelize.ENUM('socket', 'route'),
                    "field": "type",
                    "allowNull": false,
                    "defaultValue": "socket",
                    "required": true
                },
                "usage": {
                    "type": Sequelize.INTEGER,
                    "field": "usage",
                    "allowNull": false,
                    "comment": "usage time of a function or event. unit is ms",
                    "required": true
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "comment": "count of this statistics",
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
                }
            },
            {}
        ]
    },
    {
        fn: "renameColumn",
        params: [
            "chat_emotion_usermap_item",
            "ChatEmotionItemId",
            "chatEmotionItemId"
        ]
    },
    {
        fn: "renameColumn",
        params: [
            "chat_emotion_usermap_catalog",
            "ChatEmotionCatalogId",
            "chatEmotionCatalogId"
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
