'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "type" on table "file_file"
 *
 **/

var info = {
    "revision": 6,
    "name": "fileType",
    "created": "2019-06-08T01:49:56.599Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "file_file",
        "type",
        {
            "type": Sequelize.STRING,
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
