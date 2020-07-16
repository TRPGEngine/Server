'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "system_settings" on table "player_settings"
 * changeColumn "user_settings" on table "player_settings"
 *
 **/

var info = {
    "revision": 56,
    "name": "add_player_settings_default_value",
    "created": "2020-07-16T10:04:08.551Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "player_settings",
            "system_settings",
            {
                "type": Sequelize.JSON,
                "field": "system_settings",
                "defaultValue": Sequelize.Object
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "player_settings",
            "user_settings",
            {
                "type": Sequelize.JSON,
                "field": "user_settings",
                "defaultValue": Sequelize.Object
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
