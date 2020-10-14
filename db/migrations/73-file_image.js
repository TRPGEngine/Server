'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeIndex ["user_uuid","converse_uuid"] from table "chat_converse_ack"
 * createTable "file_image", deps: [player_user]
 * addIndex "chat_converse_ack_user_uuid_converse_uuid" to table "chat_converse_ack"
 *
 **/

var info = {
    "revision": 73,
    "name": "file_image",
    "created": "2020-10-14T06:21:21.632Z",
    "comment": ""
};

var migrationCommands = [
    {
        fn: "createTable",
        params: [
            "file_image",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "uuid": {
                    "type": Sequelize.UUID,
                    "field": "uuid",
                    "defaultValue": Sequelize.UUIDV1
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name",
                    "allowNull": false
                },
                "size": {
                    "type": Sequelize.INTEGER,
                    "field": "size",
                    "allowNull": false
                },
                "width": {
                    "type": Sequelize.INTEGER,
                    "field": "width"
                },
                "height": {
                    "type": Sequelize.INTEGER,
                    "field": "height"
                },
                "usage": {
                    "type": Sequelize.STRING,
                    "field": "usage"
                },
                "attach_uuid": {
                    "type": Sequelize.STRING,
                    "field": "attach_uuid"
                },
                "owner_uuid": {
                    "type": Sequelize.STRING,
                    "field": "owner_uuid"
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
                "deletedAt": {
                    "type": Sequelize.DATE,
                    "field": "deletedAt"
                },
                "ownerId": {
                    "type": Sequelize.INTEGER,
                    "field": "ownerId",
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
