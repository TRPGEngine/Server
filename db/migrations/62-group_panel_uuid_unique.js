'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "uuid" on table "group_panel"
 *
 **/

var info = {
    "revision": 62,
    "name": "group_panel_uuid_unique",
    "created": "2020-08-21T10:00:45.077Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "changeColumn",
    params: [
        "group_panel",
        "uuid",
        {
            "type": Sequelize.UUID,
            "field": "uuid",
            "unique": true,
            "defaultValue": Sequelize.UUIDV1
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
