'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "group_invite_code", deps: []
 *
 **/

var info = {
    "revision": 63,
    "name": "group_invite_code",
    "created": "2020-08-29T15:11:36.038Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "createTable",
    params: [
        "group_invite_code",
        {
            "id": {
                "type": Sequelize.INTEGER,
                "field": "id",
                "autoIncrement": true,
                "primaryKey": true,
                "allowNull": false
            },
            "code": {
                "type": Sequelize.STRING,
                "field": "code",
                "allowNull": false,
                "unique": true,
                "required": true
            },
            "group_uuid": {
                "type": Sequelize.UUID,
                "field": "group_uuid",
                "allowNull": false,
                "required": true
            },
            "from_uuid": {
                "type": Sequelize.UUID,
                "field": "from_uuid",
                "allowNull": false,
                "required": true
            },
            "expiredAt": {
                "type": Sequelize.DATE,
                "field": "expiredAt"
            },
            "times": {
                "type": Sequelize.INTEGER,
                "field": "times",
                "defaultValue": -1
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
