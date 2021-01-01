'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "group_panel_data", deps: [group_panel]
 *
 **/

var info = {
    "revision": 83,
    "name": "panel_data",
    "created": "2020-12-29T01:25:22.309Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "group_panel_data",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "group_uuid": {
                "type": Sequelize.STRING,
                "field": "group_uuid",
                "unique": true,
                "allowNull": false
            },
            "data": {
                "type": Sequelize.JSON,
                "field": "data"
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
            "panelId": {
                "type": Sequelize.INTEGER,
                "field": "panelId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "group_panel",
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
