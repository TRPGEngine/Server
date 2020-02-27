'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "fork_count" to table "actor_actor"
 * addColumn "shared" to table "actor_actor"
 *
 **/

var info = {
    "revision": 38,
    "name": "actor-share",
    "created": "2020-02-27T07:28:26.142Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "actor_actor",
            "fork_count",
            {
                "type": Sequelize.INTEGER,
                "field": "fork_count",
                "defaultValue": 0
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "actor_actor",
            "shared",
            {
                "type": Sequelize.BOOLEAN,
                "field": "shared",
                "defaultValue": false
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
