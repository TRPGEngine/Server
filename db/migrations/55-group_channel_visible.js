'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "visible" to table "group_channel"
 *
 **/

var info = {
    "revision": 55,
    "name": "group_channel_visible",
    "created": "2020-07-13T08:42:59.633Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_channel",
        "visible",
        {
            "type": Sequelize.ENUM('all', 'manager', 'assign'),
            "field": "visible",
            "defaultValue": "all"
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
