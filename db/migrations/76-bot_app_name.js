'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "name" to table "bot_app"
 * changeColumn "usage" on table "bot_app"
 *
 **/

var info = {
    "revision": 76,
    "name": "bot_app_name",
    "created": "2020-10-26T05:57:23.696Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "bot_app",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "bot_app",
            "usage",
            {
                "type": Sequelize.INTEGER,
                "field": "usage",
                "defaultValue": 0
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
