'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "data" to table "notify_history"
 * changeColumn "user_tags" on table "notify_history"
 *
 **/

var info = {
    "revision": 20,
    "name": "add_notify_history_data",
    "created": "2019-08-12T01:43:41.196Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "notify_history",
            "data",
            {
                "type": Sequelize.JSON,
                "field": "data"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "notify_history",
            "user_tags",
            {
                "type": Sequelize.JSON,
                "field": "user_tags",
                "comment": "user tags when send notify use. if not use any user tag to send, keep it null"
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
