'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "disable_check_actor_in_chat" to table "group_detail"
 *
 **/

var info = {
    "revision": 80,
    "name": "disable_check_actor_in_chat",
    "created": "2020-11-28T14:42:15.688Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_detail",
        "disable_check_actor_in_chat",
        {
            "type": Sequelize.BOOLEAN,
            "field": "disable_check_actor_in_chat",
            "comment": "是否禁止查看会话中人物卡, 用于秘密团",
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
