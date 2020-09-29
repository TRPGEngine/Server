'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "members" to table "group_panel"
 * addColumn "visible" to table "group_panel"
 *
 **/

var info = {
    "revision": 68,
    "name": "group_panel_visible",
    "created": "2020-09-27T06:39:45.697Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "group_panel",
            "members",
            {
                "type": Sequelize.JSON,
                "field": "members",
                "comment": "仅visible为assign时生效",
                "defaultValue": Sequelize.Array
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "group_panel",
            "visible",
            {
                "type": Sequelize.ENUM('all', 'manager', 'assign'),
                "field": "visible",
                "defaultValue": "all"
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
