'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * dropTable "group_channel_member"
 * addColumn "members" to table "group_channel"
 *
 **/

var info = {
    "revision": 44,
    "name": "group_channel_members",
    "created": "2020-03-11T05:54:48.389Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "dropTable",
        params: ["group_channel_member"]
    },
    {
        fn: "addColumn",
        params: [
            "group_channel",
            "members",
            {
                "type": Sequelize.JSON,
                "field": "members",
                "defaultValue": Sequelize.Array
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
