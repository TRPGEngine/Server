'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "oauth_app", deps: [player_user]
 *
 **/

var info = {
    "revision": 85,
    "name": "oauth_app",
    "created": "2021-01-12T14:13:25.431Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "oauth_app",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "appid": {
                "type": Sequelize.STRING,
                "field": "appid",
                "allowNull": false,
                "required": true
            },
            "appsecret": {
                "type": Sequelize.STRING,
                "field": "appsecret",
                "allowNull": false,
                "required": true
            },
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            },
            "icon": {
                "type": Sequelize.STRING,
                "field": "icon"
            },
            "website": {
                "type": Sequelize.STRING,
                "field": "website"
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
