'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "userId" to table "oauth_code"
 *
 **/

var info = {
    "revision": 88,
    "name": "oauth_code_user",
    "created": "2021-01-20T05:58:03.543Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "oauth_code",
        "userId",
        {
            "type": Sequelize.INTEGER,
            "field": "userId",
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
