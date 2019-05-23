'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "notify_history", deps: []
 * changeColumn "stack" on table "report_error"
 *
 **/

var info = {
    "revision": 3,
    "name": "notify_history",
    "created": "2019-05-23T06:24:52.793Z",
    "comment": "notify_history and other tiny change"
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "notify_history",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "type": {
                    "type": Sequelize.ENUM('jpush'),
                    "field": "type",
                    "allowNull": false,
                    "required": true
                },
                "platform": {
                    "type": Sequelize.ENUM('all', 'android', 'ios'),
                    "field": "platform"
                },
                "registration_id": {
                    "type": Sequelize.STRING,
                    "field": "registration_id"
                },
                "user_uuid": {
                    "type": Sequelize.UUID,
                    "field": "user_uuid"
                },
                "user_tags": {
                    "type": Sequelize.JSON,
                    "field": "user_tags"
                },
                "notification": {
                    "type": Sequelize.STRING,
                    "field": "notification"
                },
                "message": {
                    "type": Sequelize.STRING,
                    "field": "message"
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
        fn: "changeColumn",
        params: [
            "report_error",
            "stack",
            {
                "type": Sequelize.TEXT,
                "field": "stack",
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
