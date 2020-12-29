'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "group_uuid" from table "group_panel_data"
 * addColumn "group_panel_uuid" to table "group_panel_data"
 *
 **/

var info = {
    "revision": 84,
    "name": "modify_group_panel_data",
    "created": "2020-12-29T02:12:13.106Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "renameColumn",
        params: [
            "group_panel_data",
            "group_uuid",
            "group_panel_uuid"
        ]
    }, {
      fn: "removeColumn",
      params: ["group_panel_data", "deletedAt"]
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
