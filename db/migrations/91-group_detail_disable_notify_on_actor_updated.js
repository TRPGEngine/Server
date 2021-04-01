'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "disable_system_notify_on_actor_updated" to table "group_detail"
 *
 **/

var info = {
    "revision": 91,
    "name": "group_detail_disable_notify_on_actor_updated",
    "created": "2021-04-01T08:13:28.533Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_detail",
        "disable_system_notify_on_actor_updated",
        {
            "type": Sequelize.BOOLEAN,
            "field": "disable_system_notify_on_actor_updated",
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
