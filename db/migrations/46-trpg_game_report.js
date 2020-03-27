'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "trpg_game_report", deps: []
 *
 **/

var info = {
    "revision": 46,
    "name": "trpg_game_report",
    "created": "2020-03-25T06:51:30.444Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "trpg_game_report",
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
            "cast": {
                "type": Sequelize.JSON,
                "field": "cast",
                "comment": "演员表"
            },
            "content": {
                "type": Sequelize.JSON,
                "field": "content",
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
