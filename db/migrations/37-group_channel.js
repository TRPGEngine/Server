'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "group_channel", deps: [group_group, player_user]
 * createTable "group_channel_member", deps: [group_channel, player_user]
 *
 **/

var info = {
    "revision": 37,
    "name": "group_channel",
    "created": "2020-02-21T03:11:07.561Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "group_channel",
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
                    "defaultValue": Sequelize.UUIDV1
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name"
                },
                "desc": {
                    "type": Sequelize.STRING,
                    "field": "desc"
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
                "groupId": {
                    "type": Sequelize.INTEGER,
                    "field": "groupId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "group_group",
                        "key": "id"
                    },
                    "allowNull": true
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
            "group_channel_member",
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
                "groupChannelId": {
                    "type": Sequelize.INTEGER,
                    "field": "groupChannelId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "group_channel",
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
