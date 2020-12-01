'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "core_stats", deps: []
 *
 **/

var info = {
    "revision": 81,
    "name": "core_stats",
    "created": "2020-12-01T02:05:12.589Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "core_stats",
        {
            "key": {
                "type": Sequelize.STRING,
                "field": "key",
                "primaryKey": true,
                "allowNull": false
            },
            "value": {
                "type": Sequelize.JSON,
                "field": "value",
                "allowNull": false
            },
            "remark": {
                "type": Sequelize.STRING,
                "field": "remark"
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
