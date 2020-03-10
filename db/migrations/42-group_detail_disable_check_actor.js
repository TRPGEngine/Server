'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "disable_check_actor" to table "group_detail"
 *
 **/

var info = {
    "revision": 42,
    "name": "group_detail_disable_check_actor",
    "created": "2020-03-10T06:39:29.007Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_detail",
        "disable_check_actor",
        {
            "type": Sequelize.BOOLEAN,
            "field": "disable_check_actor",
            "comment": "是否禁止查看人物卡, 用于秘密团",
            "defaultValue": false
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
