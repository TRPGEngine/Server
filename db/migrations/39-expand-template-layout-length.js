'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "layout" on table "actor_template"
 *
 **/

var info = {
    "revision": 39,
    "name": "expand-template-layout-length",
    "created": "2020-03-02T07:24:27.494Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "actor_template",
        "layout",
        {
            "type": Sequelize.TEXT("medium"),
            "field": "layout"
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
