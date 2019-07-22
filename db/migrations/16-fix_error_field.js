'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "username" on table "player_user"
 * changeColumn "name" on table "actor_actor"
 *
 **/

var info = {
    "revision": 16,
    "name": "fix_error_field",
    "created": "2019-07-22T07:21:25.619Z",
    "comment": "修复一些因为之前类型字段属性写错导致没有生效的问题"
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "player_user",
            "username",
            {
                "type": Sequelize.STRING,
                "field": "username",
                "allowNull": false,
                "unique": true,
                "required": true
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "actor_actor",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
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
