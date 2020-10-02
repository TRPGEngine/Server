'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "visible" from table "group_channel"
 * removeColumn "members" from table "group_channel"
 * removeColumn "ownerId" from table "group_channel"
 *
 **/

var info = {
    "revision": 69,
    "name": "remove_groupchannel_deprecated_logic",
    "created": "2020-10-02T07:08:59.061Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["group_channel", "visible"]
    },
    {
        fn: "removeColumn",
        params: ["group_channel", "members"]
    },
    {
        fn: "removeColumn",
        params: ["group_channel", "ownerId"]
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
