'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "desc" to table "group_actor"
 * addColumn "name" to table "group_actor"
 * changeColumn "desc" on table "actor_actor"
 * changeColumn "avatar" on table "group_actor"
 *
 **/

var info = {
    "revision": 17,
    "name": "group_actor_name_desc",
    "created": "2019-07-27T14:52:04.470Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "group_actor",
            "desc",
            {
                "type": Sequelize.TEXT,
                "field": "desc"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "group_actor",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "actor_actor",
            "desc",
            {
                "type": Sequelize.TEXT,
                "field": "desc"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "group_actor",
            "avatar",
            {
                "type": Sequelize.STRING,
                "field": "avatar"
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
