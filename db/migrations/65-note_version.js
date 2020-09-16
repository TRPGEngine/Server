'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "note_note_version", deps: [note_note]
 *
 **/

var info = {
    "revision": 65,
    "name": "note_version",
    "created": "2020-09-04T07:11:28.118Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "note_note_version",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "uuid": {
                "type": Sequelize.UUID,
                "field": "uuid",
                "allowNull": false,
                "required": true,
                "unique": true,
                "defaultValue": Sequelize.UUIDV1
            },
            "title": {
                "type": Sequelize.STRING,
                "field": "title",
                "allowNull": false,
                "required": true
            },
            "data": {
                "type": Sequelize.JSON,
                "field": "data"
            },
            "comment": {
                "type": Sequelize.STRING,
                "field": "comment"
            },
            "createdAt": {
                "type": Sequelize.DATE,
                "field": "createdAt",
                "allowNull": false
            },
            "updatedAt": {
                "type": Sequelize.DATE,
                "field": "updatedAt",
                "allowNull": false
            },
            "deletedAt": {
                "type": Sequelize.DATE,
                "field": "deletedAt"
            },
            "noteId": {
                "type": Sequelize.INTEGER,
                "field": "noteId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "note_note",
                    "key": "id"
                },
                "allowNull": true
            }
        },
        {}
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
