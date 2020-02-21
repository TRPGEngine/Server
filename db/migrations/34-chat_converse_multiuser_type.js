'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "type" on table "chat_converse"
 *
 **/

var info = {
    "revision": 34,
    "name": "chat_converse_multiuser_type",
    "created": "2020-02-16T08:53:56.060Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "chat_converse",
        "type",
        {
            "type": Sequelize.ENUM('user', 'channel', 'group', 'system', 'multiuser'),
            "field": "type",
            "defaultValue": "user"
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
