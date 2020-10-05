'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "role" to table "player_user"
 *
 **/

var info = {
    "revision": 71,
    "name": "add_player_user_role",
    "created": "2020-10-05T08:28:38.739Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "player_user",
        "role",
        {
            "type": Sequelize.STRING,
            "field": "role",
            "comment": "角色",
            "defaultValue": "user"
        }
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
