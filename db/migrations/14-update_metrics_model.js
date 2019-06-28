'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "usage" from table "core_metrics"
 * removeColumn "createdAt" from table "core_metrics"
 * removeColumn "updatedAt" from table "core_metrics"
 * addColumn "avg_usage" to table "core_metrics"
 * addColumn "max_usage" to table "core_metrics"
 * addColumn "min_usage" to table "core_metrics"
 * changeColumn "date" on table "core_metrics"
 *
 **/

var info = {
    "revision": 14,
    "name": "update_metrics_model",
    "created": "2019-06-28T08:32:58.317Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "removeColumn",
        params: ["core_metrics", "usage"]
    },
    {
        fn: "removeColumn",
        params: ["core_metrics", "createdAt"]
    },
    {
        fn: "removeColumn",
        params: ["core_metrics", "updatedAt"]
    },
    {
        fn: "addColumn",
        params: [
            "core_metrics",
            "avg_usage",
            {
                "type": Sequelize.INTEGER,
                "field": "avg_usage",
                "allowNull": false,
                "comment": "Usage time of a function or event. unit is ms",
                "required": true
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "core_metrics",
            "max_usage",
            {
                "type": Sequelize.INTEGER,
                "field": "max_usage",
                "comment": "Max usage time of a function or event. unit is ms"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "core_metrics",
            "min_usage",
            {
                "type": Sequelize.INTEGER,
                "field": "min_usage",
                "comment": "Min usage time of a function or event. unit is ms"
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "core_metrics",
            "date",
            {
                "type": Sequelize.DATE,
                "field": "date",
                "allowNull": false,
                "required": true
            }
        ]
    }
];

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
