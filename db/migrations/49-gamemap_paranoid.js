'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "deletedAt" to table "trpg_game_map"
 *
 **/

var info = {
    "revision": 49,
    "name": "gamemap_paranoid",
    "created": "2020-04-05T07:56:28.929Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "trpg_game_map",
        "deletedAt",
        {
            "type": Sequelize.DATE,
            "field": "deletedAt"
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
