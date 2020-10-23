'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "bot_app", deps: [player_user]
 *
 **/

var info = {
    "revision": 75,
    "name": "bot_app",
    "created": "2020-10-23T09:51:40.175Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "bot_app",
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
            "key": {
                "type": Sequelize.UUID,
                "field": "key",
                "allowNull": false
            },
            "secret": {
                "type": Sequelize.STRING,
                "field": "secret",
                "allowNull": false
            },
            "desc": {
                "type": Sequelize.STRING,
                "field": "desc"
            },
            "website": {
                "type": Sequelize.STRING,
                "field": "website"
            },
            "usage": {
                "type": Sequelize.INTEGER,
                "field": "usage"
            },
            "is_public": {
                "type": Sequelize.BOOLEAN,
                "field": "is_public",
                "defaultValue": false
            },
            "ip_whitelist": {
                "type": Sequelize.STRING,
                "field": "ip_whitelist"
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
            "userId": {
                "type": Sequelize.INTEGER,
                "field": "userId",
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
