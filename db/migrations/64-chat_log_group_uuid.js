'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "group_uuid" to table "chat_log"
 *
 **/

var info = {
    "revision": 64,
    "name": "chat_log_group_uuid",
    "created": "2020-08-31T07:18:45.301Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "chat_log",
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
