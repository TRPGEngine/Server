'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "group_detail", deps: [group_group]
 * addColumn "max_member" to table "group_group"
 * addColumn "allow_search" to table "group_group"
 *
 **/

var info = {
    "revision": 26,
    "name": "group_detail",
    "created": "2019-10-27T15:06:26.256Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "group_detail",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "master_name": {
                    "type": Sequelize.STRING,
                    "field": "master_name"
                },
                "background_image_url": {
                    "type": Sequelize.STRING,
                    "field": "background_image_url"
                },
                "welcome_msg_payload": {
                    "type": Sequelize.JSON,
                    "field": "welcome_msg_payload"
                },
                "allow_quick_dice": {
                    "type": Sequelize.BOOLEAN,
                    "field": "allow_quick_dice"
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
                "groupId": {
                    "type": Sequelize.INTEGER,
                    "field": "groupId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "group_group",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {}
        ]
    },
    {
        fn: "addColumn",
        params: [
            "group_group",
            "max_member",
            {
                "type": Sequelize.INTEGER,
                "field": "max_member",
                "defaultValue": 50
            }
        ]
    },
    {
        fn: "addColumn",
        params: [
            "group_group",
            "allow_search",
            {
                "type": Sequelize.BOOLEAN,
                "field": "allow_search",
                "comment": "是否允许被搜索",
                "defaultValue": true
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
