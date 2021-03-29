'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "usage" to table "group_invite_code"
 *
 **/

var info = {
    "revision": 90,
    "name": "group_code_usage",
    "created": "2021-03-26T15:01:53.056Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_invite_code",
        "usage",
        {
            "type": Sequelize.INTEGER,
            "field": "usage",
            "defaultValue": 0
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
