'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "layout" to table "actor_template"
 * addColumn "built_in" to table "actor_template"
 * changeColumn "name" on table "actor_template"
 * changeColumn "name" on table "actor_template"
 * changeColumn "name" on table "actor_template"
 *
 **/

var info = {
    "revision": 15,
    "name": "add_template_layout_and_builtin",
    "created": "2019-07-02T07:09:54.934Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "actor_template",
            "layout",
            {
                "type": Sequelize.TEXT,
                "field": "layout"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "actor_template",
            "built_in",
            {
                "type": Sequelize.BOOLEAN,
                "field": "built_in"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "actor_template",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "actor_template",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "actor_template",
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
