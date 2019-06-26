'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "core_system_log", deps: []
 *
 **/

var info = {
    "revision": 13,
    "name": "core_system_log",
    "created": "2019-06-26T13:20:58.800Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "core_system_log",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
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
            "message": {
                "type": Sequelize.STRING,
                "field": "message"
            },
            "data": {
                "type": Sequelize.JSON,
                "field": "data"
            },
            "createdAt": {
                "type": Sequelize.DATE,
                "field": "createdAt",
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
