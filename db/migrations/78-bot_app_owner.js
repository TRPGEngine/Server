'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "ownerId" to table "bot_app"
 *
 **/

var info = {
    "revision": 78,
    "name": "bot_app_owner",
    "created": "2020-10-28T08:27:13.945Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "bot_app",
        "ownerId",
        {
            "type": Sequelize.INTEGER,
            "field": "ownerId",
            "onUpdate": "CASCADE",
            "onDelete": "SET NULL",
            "references": {
                "model": "player_user",
                "key": "id"
            },
            "allowNull": true
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
