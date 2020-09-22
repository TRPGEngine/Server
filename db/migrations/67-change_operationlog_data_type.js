'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "data" on table "bot_operation_log"
 *
 **/

var info = {
    "revision": 67,
    "name": "change_operationlog_data_type",
    "created": "2020-09-21T08:21:45.069Z",
    "comment": ""
};

var migrationCommands = [{
  fn: "renameColumn",
  params: [
      "bot_operation_log",
      "data",
      "data_old"
  ]
}, {
    fn: "addColumn",
    params: [
        "bot_operation_log",
        "data",
        {
            "type": Sequelize.JSON,
            "field": "data"
        }
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
