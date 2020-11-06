'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "message" on table "report_error"
 *
 **/

var info = {
    "revision": 79,
    "name": "report_error_msg",
    "created": "2020-11-06T14:10:49.330Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "report_error",
        "message",
        {
            "type": Sequelize.TEXT,
            "field": "message",
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
