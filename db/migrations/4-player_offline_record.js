'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "offline_date" to table "player_login_log"
 * addColumn "socket_id" to table "player_login_log"
 *
 **/

var info = {
    "revision": 4,
    "name": "player_offline_record",
    "created": "2019-05-24T03:43:19.569Z",
    "comment": "add player offline record col"
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "player_login_log",
            "offline_date",
            {
                "type": Sequelize.DATE,
                "field": "offline_date"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "player_login_log",
            "socket_id",
            {
                "type": Sequelize.STRING,
                "field": "socket_id"
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
