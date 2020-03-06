'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "allow_quick_dice" on table "group_detail"
 * changeColumn "master_name" on table "group_detail"
 *
 **/

var info = {
    "revision": 40,
    "name": "group_detail_defaultvalue",
    "created": "2020-03-06T03:11:13.972Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "group_detail",
            "allow_quick_dice",
            {
                "type": Sequelize.BOOLEAN,
                "field": "allow_quick_dice",
                "defaultValue": true
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "group_detail",
            "master_name",
            {
                "type": Sequelize.STRING,
                "field": "master_name",
                "defaultValue": "主持人"
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
