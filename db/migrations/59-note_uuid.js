'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "uuid" on table "note_note"
 * changeColumn "uuid" on table "note_note"
 *
 **/

var info = {
    "revision": 59,
    "name": "note_uuid",
    "created": "2020-08-01T07:34:48.225Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "note_note",
            "uuid",
            {
                "type": Sequelize.UUID,
                "field": "uuid",
                "allowNull": false,
                "required": true,
                "unique": true,
                "defaultValue": Sequelize.UUIDV1
            }
        ]
    }
];

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
