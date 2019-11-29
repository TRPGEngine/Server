'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "size" on table "file_chatimg"
 * changeColumn "name" on table "file_avatar"
 * changeColumn "size" on table "file_avatar"
 * changeColumn "size" on table "file_avatar"
 * changeColumn "name" on table "file_chatimg"
 * changeColumn "name" on table "file_chatimg"
 * changeColumn "size" on table "file_chatimg"
 * changeColumn "name" on table "file_avatar"
 * changeColumn "size" on table "file_file"
 * changeColumn "size" on table "file_file"
 * changeColumn "originalname" on table "file_file"
 * changeColumn "originalname" on table "file_file"
 * changeColumn "name" on table "file_file"
 * changeColumn "name" on table "file_file"
 *
 **/

var info = {
    "revision": 29,
    "name": "upgrade_file_model",
    "created": "2019-11-27T02:46:36.380Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "changeColumn",
        params: [
            "file_avatar",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_avatar",
            "size",
            {
                "type": Sequelize.INTEGER,
                "field": "size",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_chatimg",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_chatimg",
            "size",
            {
                "type": Sequelize.INTEGER,
                "field": "size",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_file",
            "size",
            {
                "type": Sequelize.INTEGER,
                "field": "size",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_file",
            "originalname",
            {
                "type": Sequelize.STRING,
                "field": "originalname",
                "allowNull": false
            }
        ]
    },
    {
        fn: "changeColumn",
        params: [
            "file_file",
            "name",
            {
                "type": Sequelize.STRING,
                "field": "name",
                "allowNull": false
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
