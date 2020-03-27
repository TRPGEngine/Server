'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "banned" to table "player_user"
 *
 **/

var info = {
    "revision": 45,
    "name": "user_banned",
    "created": "2020-03-22T13:50:22.591Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "player_user",
        "banned",
        {
            "type": Sequelize.BOOLEAN,
            "field": "banned",
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
