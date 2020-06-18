'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "bot_operation_log", deps: []
 *
 **/

var info = {
    "revision": 52,
    "name": "bot_operation_log",
    "created": "2020-06-18T09:22:12.588Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "bot_operation_log",
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
            "hostname": {
                "type": Sequelize.STRING,
                "field": "hostname"
            },
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "required": true
            },
            "data": {
                "type": Sequelize.BLOB,
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
