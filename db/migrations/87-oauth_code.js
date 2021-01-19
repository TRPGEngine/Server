'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "oauth_code", deps: []
 *
 **/

var info = {
    "revision": 87,
    "name": "oauth_code",
    "created": "2021-01-19T09:48:53.117Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "oauth_code",
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
                "allowNull": false
            },
            "code": {
                "type": Sequelize.STRING,
                "field": "code",
                "allowNull": false
            },
            "scope": {
                "type": Sequelize.STRING,
                "field": "scope",
                "defaultValue": "public"
            },
            "expiredAt": {
                "type": Sequelize.DATE,
                "field": "expiredAt"
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
