'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * dropTable "bot_operation_log"
 * changeColumn "ua" on table "report_error"
 *
 **/

var info = {
    "revision": 53,
    "name": "update_report_ua_length",
    "created": "2020-06-20T10:24:21.357Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "dropTable",
        params: ["bot_operation_log"]
    },
    {
        fn: "changeColumn",
        params: [
            "report_error",
            "ua",
            {
                "type": Sequelize.TEXT,
                "field": "ua"
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
