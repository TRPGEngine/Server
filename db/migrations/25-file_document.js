'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "file_document", deps: []
 *
 **/

var info = {
    "revision": 25,
    "name": "file_document",
    "created": "2019-10-23T13:28:02.287Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "file_document",
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
                "defaultValue": Sequelize.UUIDV1,
                "required": true
            },
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            },
            "link": {
                "type": Sequelize.STRING,
                "field": "link",
                "allowNull": false,
                "required": true
            },
            "views": {
                "type": Sequelize.INTEGER,
                "field": "views",
                "defaultValue": 0
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
