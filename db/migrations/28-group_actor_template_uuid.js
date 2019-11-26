'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "actor_template_uuid" to table "group_actor"
 *
 **/

var info = {
    "revision": 28,
    "name": "group_actor_template_uuid",
    "created": "2019-11-26T07:09:45.635Z",
    "comment": "actor_template_uuid is cache of ActorActor to avoid ActorActor edit"
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "group_actor",
        "actor_template_uuid",
        {
            "type": Sequelize.UUID,
            "field": "actor_template_uuid"
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
