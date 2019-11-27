'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "owner_uuid" to table "file_avatar"
 *
 **/

var info = {
    "revision": 30,
    "name": "add_avatar_owner_uuid",
    "created": "2019-11-27T03:14:55.999Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "file_avatar",
        "owner_uuid",
        {
            "type": Sequelize.STRING,
            "field": "owner_uuid"
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
