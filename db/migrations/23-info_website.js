'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "info_website", deps: []
 *
 **/

var info = {
    "revision": 23,
    "name": "info_website",
    "created": "2019-09-26T02:09:17.652Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "info_website",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "url": {
                "type": Sequelize.STRING,
                "field": "url",
                "validate": {
                    "isUrl": true
                },
                "unique": true,
                "allowNull": false
            },
            "title": {
                "type": Sequelize.STRING,
                "field": "title"
            },
            "content": {
                "type": Sequelize.STRING,
                "field": "content"
            },
            "icon": {
                "type": Sequelize.STRING,
                "field": "icon"
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
