'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "core_global_config", deps: []
 *
 **/

var info = {
    "revision": 12,
    "name": "core_global_config",
    "created": "2019-06-25T08:16:23.645Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "core_global_config",
        {
            "name": {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false,
                "primaryKey": true,
                "required": true
            },
            "value": {
                "type": Sequelize.STRING,
                "field": "value",
                "allowNull": false,
                "required": true
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
