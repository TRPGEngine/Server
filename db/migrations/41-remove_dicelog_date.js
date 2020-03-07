'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "date" from table "dice_log"
 *
 **/

var info = {
    "revision": 41,
    "name": "remove_dicelog_date",
    "created": "2020-03-07T03:42:20.360Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "removeColumn",
    params: ["dice_log", "date"]
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
