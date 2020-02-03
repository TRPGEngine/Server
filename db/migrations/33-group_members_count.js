'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "members_count" to table "group_group"
 *
 **/

var info = {
    "revision": 33,
    "name": "group_members_count",
    "created": "2020-02-03T16:54:07.415Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_group",
        "members_count",
        {
            "type": Sequelize.INTEGER,
            "field": "members_count",
            "comment": "一个反范式操作，用于方便的获取用户数",
            "defaultValue": 0
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
