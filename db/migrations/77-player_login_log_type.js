'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "type" on table "player_login_log"
 *
 **/

var info = {
    "revision": 77,
    "name": "player_login_log_type",
    "created": "2020-10-28T07:38:39.282Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "player_login_log",
        "type",
        {
            "type": Sequelize.ENUM('standard', 'token', 'app_standard', 'app_token', 'internal'),
            "field": "type",
            "allowNull": false,
            "required": true
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
