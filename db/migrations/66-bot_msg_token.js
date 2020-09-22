'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "bot_msg_token", deps: []
 *
 **/

var info = {
    "revision": 66,
    "name": "bot_msg_token",
    "created": "2020-09-17T15:02:29.653Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "bot_msg_token",
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
            "token": {
                "type": Sequelize.UUID,
                "field": "token",
                "defaultValue": Sequelize.UUIDV1
            },
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false
            },
            "group_uuid": {
                "type": Sequelize.STRING,
                "field": "group_uuid",
                "allowNull": false
            },
            "channel_uuid": {
                "type": Sequelize.STRING,
                "field": "channel_uuid"
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
