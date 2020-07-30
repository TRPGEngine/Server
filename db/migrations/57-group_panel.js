'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "group_panel", deps: [group_group]
 *
 **/

var info = {
    "revision": 57,
    "name": "group_panel",
    "created": "2020-07-30T08:55:51.906Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "group_panel",
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
                "defaultValue": Sequelize.UUIDV1
            },
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            },
            "type": {
                "type": Sequelize.STRING,
                "field": "type",
                "allowNull": false,
                "required": true
            },
            "color": {
                "type": Sequelize.STRING(24),
                "field": "color"
            },
            "order": {
                "type": Sequelize.INTEGER,
                "field": "order",
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
            },
            "deletedAt": {
                "type": Sequelize.DATE,
                "field": "deletedAt"
            },
            "groupId": {
                "type": Sequelize.INTEGER,
                "field": "groupId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "group_group",
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
