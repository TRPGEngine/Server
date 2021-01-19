'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "appid" on table "oauth_app"
 * changeColumn "appid" on table "oauth_app"
 * changeColumn "appsecret" on table "oauth_app"
 * changeColumn "name" on table "oauth_app"
 * changeColumn "name" on table "oauth_app"
 *
 **/

var info = {
    "revision": 86,
    "name": "oauth_app_unique",
    "created": "2021-01-19T08:20:49.888Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "oauth_app",
            "appid",
            {
                "type": Sequelize.STRING,
                "field": "appid",
                "unique": true,
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "oauth_app",
            "appsecret",
            {
                "type": Sequelize.STRING,
                "field": "appsecret",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "oauth_app",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "unique": true,
                "allowNull": false
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
