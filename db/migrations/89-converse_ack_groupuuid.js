'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "group_uuid" to table "chat_converse_ack"
 *
 **/

var info = {
    "revision": 89,
    "name": "converse_ack_groupuuid",
    "created": "2021-03-18T03:22:33.492Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "chat_converse_ack",
        "group_uuid",
        {
            "type": Sequelize.UUID,
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
