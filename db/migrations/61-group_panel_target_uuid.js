'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "target_uuid" to table "group_panel"
 *
 **/

var info = {
    "revision": 61,
    "name": "group_panel_target_uuid",
    "created": "2020-08-12T12:34:15.681Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_panel",
        "target_uuid",
        {
            "type": Sequelize.STRING,
            "field": "target_uuid",
            "comment": "根据类型指向不同的模型的UUID"
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
