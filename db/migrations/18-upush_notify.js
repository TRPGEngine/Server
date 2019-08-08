'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "notify_upush", deps: [player_user]
 * changeColumn "type" on table "notify_history"
 *
 **/

var info = {
    "revision": 18,
    "name": "upush_notify",
    "created": "2019-08-08T13:26:18.828Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "notify_upush",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "registration_id": {
                    "type": Sequelize.STRING,
                    "field": "registration_id",
                    "allowNull": false,
                    "unique": true,
                    "required": true
                },
                "user_uuid": {
                    "type": Sequelize.UUID,
                    "field": "user_uuid",
                    "allowNull": false,
                    "required": true
                },
                "user_tags": {
                    "type": Sequelize.JSON,
                    "field": "user_tags"
                },
                "is_active": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_active"
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
                },
                "userId": {
                    "type": Sequelize.INTEGER,
                    "field": "userId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "notify_history",
            "type",
            {
                "type": Sequelize.ENUM('jpush', 'upush'),
                "field": "type",
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
