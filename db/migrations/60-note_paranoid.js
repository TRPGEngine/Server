'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "deletedAt" to table "note_note"
 *
 **/

var info = {
    "revision": 60,
    "name": "note_paranoid",
    "created": "2020-08-07T09:20:20.589Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "note_note",
        "deletedAt",
        {
            "type": Sequelize.DATE,
            "field": "deletedAt"
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
