'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "is_public" to table "actor_template"
 *
 **/

var info = {
    "revision": 27,
    "name": "actor_template_public",
    "created": "2019-11-03T06:50:27.627Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "actor_template",
        "is_public",
        {
            "type": Sequelize.BOOLEAN,
            "field": "is_public",
            "defaultValue": true
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
