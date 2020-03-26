'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "ownerId" to table "trpg_game_report"
 *
 **/

var info = {
    "revision": 47,
    "name": "game_report_owner",
    "created": "2020-03-26T03:49:26.905Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "trpg_game_report",
        "ownerId",
        {
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
