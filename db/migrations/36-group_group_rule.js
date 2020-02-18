'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "rule" to table "group_group"
 *
 **/

var info = {
    "revision": 36,
    "name": "group_group_rule",
    "created": "2020-02-17T12:37:36.580Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_group",
        "rule",
        {
            "type": Sequelize.TEXT,
            "field": "rule",
            "defaultValue": ""
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
