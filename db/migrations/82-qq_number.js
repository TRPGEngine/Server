'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "qq_number" to table "player_user"
 *
 **/

var info = {
    "revision": 82,
    "name": "qq_number",
    "created": "2020-12-07T01:47:58.950Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "player_user",
        "qq_number",
        {
            "type": Sequelize.STRING,
            "field": "qq_number"
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
