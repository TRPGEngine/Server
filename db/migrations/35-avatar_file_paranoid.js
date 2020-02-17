'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "deletedAt" to table "file_avatar"
 * addColumn "deletedAt" to table "file_file"
 *
 **/

var info = {
    "revision": 35,
    "name": "avatar_file_paranoid",
    "created": "2020-02-17T09:06:45.473Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "file_avatar",
            "deletedAt",
            {
                "type": Sequelize.DATE,
                "field": "deletedAt"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "file_file",
            "deletedAt",
            {
                "type": Sequelize.DATE,
                "field": "deletedAt"
            }
        ]
    }
];

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
