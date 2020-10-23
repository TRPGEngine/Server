'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "group_uuid" to table "trpg_game_report"
 *
 **/

var info = {
    "revision": 74,
    "name": "game_report_group",
    "created": "2020-10-22T03:25:09.411Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "trpg_game_report",
        "group_uuid",
        {
            "type": Sequelize.STRING,
            "field": "group_uuid"
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
