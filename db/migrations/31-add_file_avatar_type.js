'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "type" on table "file_avatar"
 *
 **/

var info = {
    "revision": 31,
    "name": "add_file_avatar_type",
    "created": "2019-11-27T09:41:46.523Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "file_avatar",
        "type",
        {
            "type": Sequelize.ENUM('actor', 'user', 'group', 'groupActor'),
            "field": "type"
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
