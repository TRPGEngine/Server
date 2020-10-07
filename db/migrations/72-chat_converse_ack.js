'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "chat_converse_ack", deps: []
 * addIndex ["user_uuid","converse_uuid"] to table "chat_converse_ack"
 *
 **/

var info = {
    "revision": 72,
    "name": "chat_converse_ack",
    "created": "2020-10-06T10:11:54.652Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "chat_converse_ack",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "user_uuid": {
                    "type": Sequelize.UUID,
                    "field": "user_uuid",
                    "allowNull": false
                },
                "converse_uuid": {
                    "type": Sequelize.UUID,
                    "field": "converse_uuid",
                    "allowNull": false
                },
                "last_log_uuid": {
                    "type": Sequelize.UUID,
                    "field": "last_log_uuid",
                    "allowNull": false
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
    },
    {
        fn: "addIndex",
        params: [
            "chat_converse_ack",
            ["user_uuid", "converse_uuid"],
            {
                "name": "chat_converse_ack_user_uuid_converse_uuid",
                "type": "UNIQUE"
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
