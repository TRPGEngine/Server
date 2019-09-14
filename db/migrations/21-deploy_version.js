'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "deploy_version", deps: []
 * changeColumn "username" on table "player_user"
 * changeColumn "password" on table "player_user"
 * changeColumn "nickname" on table "player_user"
 * changeColumn "avatar" on table "player_user"
 *
 **/

var info = {
    "revision": 21,
    "name": "deploy_version",
    "created": "2019-09-14T12:32:22.904Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "deploy_version",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "version": {
                    "type": Sequelize.STRING,
                    "field": "version",
                    "validate": {},
                    "allowNull": false
                },
                "platform": {
                    "type": Sequelize.ENUM('android', 'ios', 'windows', 'mac', 'linux'),
                    "field": "platform",
                    "allowNull": false
                },
                "download_url": {
                    "type": Sequelize.STRING,
                    "field": "download_url",
                    "comment": "二进制文件完整下载地址"
                },
                "describe": {
                    "type": Sequelize.TEXT,
                    "field": "describe",
                    "comment": "版本更新内容"
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "deletedAt": {
                    "type": Sequelize.DATE,
                    "field": "deletedAt"
                }
            },
            {}
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "player_user",
            "username",
            {
                "type": Sequelize.STRING,
                "field": "username",
                "unique": true,
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "player_user",
            "password",
            {
                "type": Sequelize.STRING,
                "field": "password",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "player_user",
            "nickname",
            {
                "type": Sequelize.STRING,
                "field": "nickname"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "player_user",
            "avatar",
            {
                "type": Sequelize.STRING,
                "field": "avatar",
                "defaultValue": ""
            }
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
