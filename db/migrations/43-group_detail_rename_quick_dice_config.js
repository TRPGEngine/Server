'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "allow_quick_dice" from table "group_detail"
 * addColumn "disable_quick_dice" to table "group_detail"
 *
 **/

var info = {
    "revision": 43,
    "name": "group_detail_rename_quick_dice_config",
    "created": "2020-03-10T10:59:06.558Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["group_detail", "allow_quick_dice"]
    },
    {
        fn: "addColumn",
        params: [
            "group_detail",
            "disable_quick_dice",
            {
                "type": Sequelize.BOOLEAN,
                "field": "disable_quick_dice",
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
