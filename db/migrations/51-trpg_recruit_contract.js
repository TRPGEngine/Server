'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "platform" to table "trpg_recruit"
 * addColumn "contact_type" to table "trpg_recruit"
 * addColumn "contact_content" to table "trpg_recruit"
 *
 **/

var info = {
    "revision": 51,
    "name": "trpg_recruit_contract",
    "created": "2020-06-02T08:58:00.502Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "addColumn",
        params: [
            "trpg_recruit",
            "platform",
            {
                "type": Sequelize.ENUM('trpgengine', 'qq', 'other'),
                "field": "platform",
                "defaultValue": "other"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "trpg_recruit",
            "contact_type",
            {
                "type": Sequelize.ENUM('user', 'group'),
                "field": "contact_type",
                "defaultValue": "user"
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "trpg_recruit",
            "contact_content",
            {
                "type": Sequelize.STRING,
                "field": "contact_content"
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
