'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "trpg_game_map", deps: [group_group]
 *
 **/

var info = {
    "revision": 48,
    "name": "game_map",
    "created": "2020-04-03T08:22:32.690Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "trpg_game_map",
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
                "field": "name"
            },
            "width": {
                "type": Sequelize.INTEGER,
                "field": "width"
            },
            "height": {
                "type": Sequelize.INTEGER,
                "field": "height"
            },
            "data": {
                "type": Sequelize.JSON,
                "field": "data",
                "defaultValue": Sequelize.Object
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
