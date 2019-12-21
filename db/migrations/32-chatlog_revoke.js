'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "revoke" to table "chat_log"
 *
 **/

var info = {
    "revision": 32,
    "name": "chatlog_revoke",
    "created": "2019-12-20T01:11:56.482Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "chat_log",
        "revoke",
        {
            "type": Sequelize.BOOLEAN,
            "field": "revoke",
            "comment": "消息撤回",
            "defaultValue": false
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
