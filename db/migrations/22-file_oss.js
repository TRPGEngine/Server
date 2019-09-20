'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "file_oss", deps: [file_file]
 * changeColumn "version" on table "deploy_version"
 *
 **/

var info = {
    "revision": 22,
    "name": "file_oss",
    "created": "2019-09-18T12:43:03.358Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "file_oss",
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
                "platform": {
                    "type": Sequelize.ENUM('qiniu'),
                    "field": "platform",
                    "allowNull": false
                },
                "bucket": {
                    "type": Sequelize.STRING,
                    "field": "bucket"
                },
                "key": {
                    "type": Sequelize.STRING,
                    "field": "key"
                },
                "hash": {
                    "type": Sequelize.STRING,
                    "field": "hash"
                },
                "size": {
                    "type": Sequelize.INTEGER,
                    "field": "size"
                },
                "mimetype": {
                    "type": Sequelize.STRING,
                    "field": "mimetype"
                },
                "extra_data": {
                    "type": Sequelize.JSON,
                    "field": "extra_data",
                    "comment": "额外信息，如图片的信息之类的"
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
                "fileId": {
                    "type": Sequelize.INTEGER,
                    "field": "fileId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "file_file",
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
