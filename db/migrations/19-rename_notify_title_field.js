'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 * Table notify_history
 * rename column name from notification to title
 *
 * removeColumn "notification" from table "notify_history"
 * addColumn "title" to table "notify_history"
 *
 **/

var info = {
    "revision": 19,
    "name": "rename_notify_title_field",
    "created": "2019-08-12T01:22:42.774Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "renameColumn",
        params: [
            "notify_history",
            "notification",
            "title"
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
