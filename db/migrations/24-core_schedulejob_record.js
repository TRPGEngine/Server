'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "core_schedulejob_history", deps: []
 *
 **/

var info = {
    "revision": 24,
    "name": "core_schedulejob_record",
    "created": "2019-10-14T09:09:44.769Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "core_schedulejob_history",
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
                "type": Sequelize.ENUM('stat', 'schedule', 'custom', 'unknown'),
                "field": "type",
                "defaultValue": "unknown"
            },
            "hostname": {
                "type": Sequelize.STRING,
                "field": "hostname"
            },
            "result": {
                "type": Sequelize.STRING,
                "field": "result"
            },
            "completed": {
                "type": Sequelize.BOOLEAN,
                "field": "completed"
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
