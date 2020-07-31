'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "data" to table "note_note"
 *
 **/

var info = {
    "revision": 58,
    "name": "note_data",
    "created": "2020-07-31T08:46:30.586Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "note_note",
        "data",
        {
            "type": Sequelize.JSON,
            "field": "data"
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
