'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "path" to table "file_file"
 *
 **/

var info = {
    "revision": 7,
    "name": "filePathRecord",
    "created": "2019-06-08T12:53:26.351Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "file_file",
        "path",
        {
            "type": Sequelize.STRING,
            "field": "path"
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
