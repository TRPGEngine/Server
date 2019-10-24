'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * addColumn "alignment" to table "player_user"
 *
 **/

var info = {
    "revision": 25,
    "name": "player_alignment",
    "created": "2019-10-21T02:25:47.107Z",
    "comment": ""
};

var migrationCommands = [{
    fn: "addColumn",
    params: [
        "player_user",
        "alignment",
        {
            "type": Sequelize.ENUM('LG', 'NG', 'CG', 'LN', 'TN', 'CN', 'LE', 'NE', 'CE'),
            "field": "alignment",
            "comment": "阵营: LG守序善良 NG中立善良 CG混乱善良 LN守序中立 TN绝对中立 CN混乱中立 LE守序邪恶 NE中立邪恶 CE混乱邪恶"
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
