'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "salt" to table "player_user"
 *
 **/

var info = {
    "revision": 10,
    "name": "player_password_salt",
    "created": "2019-06-23T05:17:10.309Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "player_user",
        "salt",
        {
            "type": Sequelize.STRING,
            "field": "salt"
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
