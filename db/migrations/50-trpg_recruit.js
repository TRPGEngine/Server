'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "trpg_recruit", deps: [player_user]
 *
 **/

var info = {
    "revision": 50,
    "name": "trpg_recruit",
    "created": "2020-04-26T03:58:27.195Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "trpg_recruit",
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
            "title": {
                "type": Sequelize.STRING,
                "field": "title",
                "allowNull": false
            },
            "author": {
                "type": Sequelize.STRING,
                "field": "author",
                "allowNull": false
            },
            "content": {
                "type": Sequelize.TEXT,
                "field": "content",
                "allowNull": false
            },
            "completed": {
                "type": Sequelize.BOOLEAN,
                "field": "completed",
                "defaultValue": false
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
            "ownerId": {
                "type": Sequelize.INTEGER,
                "field": "ownerId",
                "onUpdate": "CASCADE",
                "onDelete": "SET NULL",
                "references": {
                    "model": "player_user",
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
