'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "player_user", deps: []
 * createTable "mail_record", deps: []
 * createTable "player_invite", deps: []
 * createTable "player_login_log", deps: []
 * createTable "player_settings", deps: []
 * createTable "report_login_times_monthly", deps: []
 * createTable "report_login_times_weekly", deps: []
 * createTable "report_login_times_daily", deps: []
 * createTable "report_chatlog_monthly", deps: []
 * createTable "report_chatlog_weekly", deps: []
 * createTable "chat_log", deps: []
 * createTable "report_chatlog_daily", deps: []
 * createTable "report_register_monthly", deps: []
 * createTable "dice_log", deps: []
 * createTable "report_register_weekly", deps: []
 * createTable "report_register_daily", deps: []
 * createTable "group_invite", deps: []
 * createTable "report_error", deps: []
 * createTable "group_request", deps: []
 * createTable "help_feedback", deps: []
 * createTable "actor_template", deps: [player_user]
 * createTable "note_note", deps: [player_user]
 * createTable "player_friends", deps: [player_user, player_user]
 * createTable "group_group", deps: [player_user]
 * createTable "group_group_members", deps: [player_user, group_group]
 * createTable "chat_converse", deps: [player_user]
 * createTable "chat_converse_participants", deps: [player_user, chat_converse]
 * createTable "oauth_qq_access_info", deps: [player_user]
 * createTable "actor_actor", deps: [player_user]
 * createTable "file_file", deps: [player_user]
 * createTable "file_chatimg", deps: [player_user]
 * createTable "file_avatar", deps: [player_user]
 * createTable "mail_list", deps: [player_user]
 * createTable "group_actor", deps: [player_user, actor_actor, group_group]
 *
 **/

var info = {
    "revision": 1,
    "name": "init",
    "created": "2019-03-18T06:06:01.076Z",
    "comment": "Init V2 Version"
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "player_user",
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
                    "defaultValue": Sequelize.UUIDV4,
                    "allowNull": false
                },
                "username": {
                    "type": Sequelize.STRING,
                    "field": "username",
                    "allowNull": false,
                    "uniq": true,
                    "required": true
                },
                "password": {
                    "type": Sequelize.STRING,
                    "field": "password",
                    "allowNull": false,
                    "required": true
                },
                "nickname": {
                    "type": Sequelize.STRING,
                    "field": "nickname",
                    "required": false
                },
                "avatar": {
                    "type": Sequelize.STRING,
                    "field": "avatar",
                    "defaultValue": "",
                    "required": false
                },
                "last_login": {
                    "type": Sequelize.DATE,
                    "field": "last_login"
                },
                "last_ip": {
                    "type": Sequelize.STRING,
                    "field": "last_ip"
                },
                "token": {
                    "type": Sequelize.STRING,
                    "field": "token"
                },
                "app_token": {
                    "type": Sequelize.STRING,
                    "field": "app_token"
                },
                "sex": {
                    "type": Sequelize.ENUM('男', '女', '其他', '保密'),
                    "field": "sex",
                    "defaultValue": "保密"
                },
                "sign": {
                    "type": Sequelize.STRING,
                    "field": "sign"
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
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "mail_record",
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
                    "allowNull": false,
                    "required": true
                },
                "from": {
                    "type": Sequelize.STRING,
                    "field": "from",
                    "allowNull": false,
                    "required": true
                },
                "to": {
                    "type": Sequelize.STRING,
                    "field": "to",
                    "allowNull": false,
                    "required": true
                },
                "subject": {
                    "type": Sequelize.STRING,
                    "field": "subject",
                    "allowNull": false,
                    "required": true
                },
                "body": {
                    "type": Sequelize.TEXT,
                    "field": "body"
                },
                "host": {
                    "type": Sequelize.STRING,
                    "field": "host",
                    "allowNull": false,
                    "required": true
                },
                "port": {
                    "type": Sequelize.STRING,
                    "field": "port",
                    "allowNull": false,
                    "required": true
                },
                "secure": {
                    "type": Sequelize.BOOLEAN,
                    "field": "secure",
                    "defaultValue": true
                },
                "is_success": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_success",
                    "defaultValue": true
                },
                "data": {
                    "type": Sequelize.JSON,
                    "field": "data"
                },
                "error": {
                    "type": Sequelize.STRING(1000),
                    "field": "error"
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
        fn: "createTable",
        params: [
            "player_invite",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "uuid": {
                    "type": Sequelize.STRING,
                    "field": "uuid",
                    "unique": true,
                    "required": false
                },
                "from_uuid": {
                    "type": Sequelize.STRING,
                    "field": "from_uuid",
                    "allowNull": false,
                    "required": true
                },
                "to_uuid": {
                    "type": Sequelize.STRING,
                    "field": "to_uuid",
                    "allowNull": false,
                    "required": true
                },
                "is_agree": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_agree",
                    "defaultValue": false
                },
                "is_refuse": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_refuse",
                    "defaultValue": false
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
        fn: "createTable",
        params: [
            "player_login_log",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "user_uuid": {
                    "type": Sequelize.STRING,
                    "field": "user_uuid"
                },
                "user_name": {
                    "type": Sequelize.STRING,
                    "field": "user_name"
                },
                "type": {
                    "type": Sequelize.ENUM('standard', 'token', 'app_standard', 'app_token'),
                    "field": "type",
                    "allowNull": false,
                    "required": true
                },
                "channel": {
                    "type": Sequelize.STRING,
                    "field": "channel"
                },
                "ip": {
                    "type": Sequelize.STRING,
                    "field": "ip"
                },
                "ip_address": {
                    "type": Sequelize.STRING,
                    "field": "ip_address"
                },
                "platform": {
                    "type": Sequelize.STRING,
                    "field": "platform"
                },
                "device_info": {
                    "type": Sequelize.JSON,
                    "field": "device_info"
                },
                "is_success": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_success"
                },
                "token": {
                    "type": Sequelize.STRING,
                    "field": "token"
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
        fn: "createTable",
        params: [
            "player_settings",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "user_uuid": {
                    "type": Sequelize.STRING,
                    "field": "user_uuid",
                    "unique": true
                },
                "user_settings": {
                    "type": Sequelize.JSON,
                    "field": "user_settings"
                },
                "system_settings": {
                    "type": Sequelize.JSON,
                    "field": "system_settings"
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
        fn: "createTable",
        params: [
            "report_login_times_monthly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "login_count": {
                    "type": Sequelize.INTEGER,
                    "field": "login_count",
                    "allowNull": false,
                    "required": true
                },
                "user_count": {
                    "type": Sequelize.INTEGER,
                    "field": "user_count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "report_login_times_weekly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "login_count": {
                    "type": Sequelize.INTEGER,
                    "field": "login_count",
                    "allowNull": false,
                    "required": true
                },
                "user_count": {
                    "type": Sequelize.INTEGER,
                    "field": "user_count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "report_login_times_daily",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "login_count": {
                    "type": Sequelize.INTEGER,
                    "field": "login_count",
                    "allowNull": false,
                    "required": true
                },
                "user_count": {
                    "type": Sequelize.INTEGER,
                    "field": "user_count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "report_chatlog_monthly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start",
                    "time": false
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end",
                    "time": false
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
        fn: "createTable",
        params: [
            "report_chatlog_weekly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start",
                    "time": false
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end",
                    "time": false
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
        fn: "createTable",
        params: [
            "chat_log",
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
                    "allowNull": false,
                    "defaultValue": Sequelize.UUIDV4,
                    "required": true
                },
                "sender_uuid": {
                    "type": Sequelize.STRING,
                    "field": "sender_uuid",
                    "allowNull": false,
                    "required": true
                },
                "to_uuid": {
                    "type": Sequelize.STRING,
                    "field": "to_uuid"
                },
                "converse_uuid": {
                    "type": Sequelize.STRING,
                    "field": "converse_uuid"
                },
                "message": {
                    "type": Sequelize.STRING(1000),
                    "field": "message"
                },
                "type": {
                    "type": Sequelize.ENUM('normal', 'system', 'ooc', 'speak', 'action', 'cmd', 'card', 'tip', 'file'),
                    "field": "type"
                },
                "data": {
                    "type": Sequelize.JSON,
                    "field": "data"
                },
                "is_group": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_group",
                    "defaultValue": false
                },
                "is_public": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_public",
                    "defaultValue": true
                },
                "date": {
                    "type": Sequelize.DATE,
                    "field": "date"
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
        fn: "createTable",
        params: [
            "report_chatlog_daily",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start",
                    "time": false
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end",
                    "time": false
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
        fn: "createTable",
        params: [
            "report_register_monthly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "dice_log",
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
                "sender_uuid": {
                    "type": Sequelize.UUID,
                    "field": "sender_uuid",
                    "required": false
                },
                "to_uuid": {
                    "type": Sequelize.UUID,
                    "field": "to_uuid",
                    "required": false
                },
                "is_group": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_group"
                },
                "is_private": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_private"
                },
                "dice_request": {
                    "type": Sequelize.STRING,
                    "field": "dice_request"
                },
                "dice_expression": {
                    "type": Sequelize.STRING(1000),
                    "field": "dice_expression"
                },
                "dice_result": {
                    "type": Sequelize.INTEGER,
                    "field": "dice_result"
                },
                "date": {
                    "type": Sequelize.DATE,
                    "field": "date"
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
        fn: "createTable",
        params: [
            "report_register_weekly",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "report_register_daily",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "count": {
                    "type": Sequelize.INTEGER,
                    "field": "count",
                    "allowNull": false,
                    "required": true
                },
                "start": {
                    "type": Sequelize.DATEONLY,
                    "field": "start"
                },
                "end": {
                    "type": Sequelize.DATEONLY,
                    "field": "end"
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
        fn: "createTable",
        params: [
            "group_invite",
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
                "to_uuid": {
                    "type": Sequelize.UUID,
                    "field": "to_uuid",
                    "allowNull": false,
                    "required": true
                },
                "is_agree": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_agree",
                    "defaultValue": false
                },
                "is_refuse": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_refuse",
                    "defaultValue": false
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
        fn: "createTable",
        params: [
            "report_error",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "ip": {
                    "type": Sequelize.STRING,
                    "field": "ip",
                    "allowNull": false,
                    "required": true
                },
                "ua": {
                    "type": Sequelize.STRING,
                    "field": "ua"
                },
                "version": {
                    "type": Sequelize.STRING,
                    "field": "version"
                },
                "message": {
                    "type": Sequelize.STRING,
                    "field": "message",
                    "allowNull": false,
                    "required": true
                },
                "stack": {
                    "type": Sequelize.STRING(1000),
                    "field": "stack",
                    "allowNull": false,
                    "required": true
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
        fn: "createTable",
        params: [
            "group_request",
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
                "is_agree": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_agree",
                    "defaultValue": false
                },
                "is_refuse": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_refuse",
                    "defaultValue": false
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
        fn: "createTable",
        params: [
            "help_feedback",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "username": {
                    "type": Sequelize.STRING,
                    "field": "username",
                    "allowNull": false,
                    "required": true
                },
                "contact": {
                    "type": Sequelize.STRING,
                    "field": "contact"
                },
                "content": {
                    "type": Sequelize.STRING(1000),
                    "field": "content",
                    "allowNull": false,
                    "required": true
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
        fn: "createTable",
        params: [
            "actor_template",
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
                    "require": true
                },
                "desc": {
                    "type": Sequelize.STRING,
                    "field": "desc"
                },
                "avatar": {
                    "type": Sequelize.STRING,
                    "field": "avatar"
                },
                "info": {
                    "type": Sequelize.TEXT,
                    "field": "info"
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
                "creatorId": {
                    "type": Sequelize.INTEGER,
                    "field": "creatorId",
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
        fn: "createTable",
        params: [
            "note_note",
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
                    "allowNull": false,
                    "required": true
                },
                "title": {
                    "type": Sequelize.STRING,
                    "field": "title",
                    "allowNull": false,
                    "required": true
                },
                "content": {
                    "type": Sequelize.TEXT,
                    "field": "content"
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
    },
    {
        fn: "createTable",
        params: [
            "player_friends",
            {
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
                "playerUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "playerUserId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                },
                "friendId": {
                    "type": Sequelize.INTEGER,
                    "field": "friendId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "group_group",
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
                "type": {
                    "type": Sequelize.ENUM('group', 'channel', 'test'),
                    "field": "type"
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name"
                },
                "sub_name": {
                    "type": Sequelize.STRING,
                    "field": "sub_name"
                },
                "desc": {
                    "type": Sequelize.STRING,
                    "field": "desc"
                },
                "avatar": {
                    "type": Sequelize.STRING,
                    "field": "avatar",
                    "defaultValue": ""
                },
                "creator_uuid": {
                    "type": Sequelize.STRING,
                    "field": "creator_uuid",
                    "allowNull": false,
                    "required": true
                },
                "owner_uuid": {
                    "type": Sequelize.STRING,
                    "field": "owner_uuid",
                    "allowNull": false,
                    "required": true
                },
                "managers_uuid": {
                    "type": Sequelize.JSON,
                    "field": "managers_uuid",
                    "defaultValue": Sequelize.Array
                },
                "maps_uuid": {
                    "type": Sequelize.JSON,
                    "field": "maps_uuid",
                    "defaultValue": Sequelize.Array
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
    },
    {
        fn: "createTable",
        params: [
            "group_group_members",
            {
                "selected_group_actor_uuid": {
                    "type": Sequelize.STRING,
                    "field": "selected_group_actor_uuid"
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
                "playerUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "playerUserId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                },
                "groupGroupId": {
                    "type": Sequelize.INTEGER,
                    "field": "groupGroupId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "group_group",
                        "key": "id"
                    },
                    "primaryKey": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "chat_converse",
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
                    "allowNull": false,
                    "required": true,
                    "defaultValue": Sequelize.UUIDV4
                },
                "type": {
                    "type": Sequelize.ENUM('user', 'channel', 'group', 'system'),
                    "field": "type",
                    "defaultValue": "user"
                },
                "name": {
                    "type": Sequelize.STRING,
                    "field": "name"
                },
                "icon": {
                    "type": Sequelize.STRING,
                    "field": "icon"
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
    },
    {
        fn: "createTable",
        params: [
            "chat_converse_participants",
            {
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
                "playerUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "playerUserId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "player_user",
                        "key": "id"
                    },
                    "primaryKey": true
                },
                "chatConverseId": {
                    "type": Sequelize.INTEGER,
                    "field": "chatConverseId",
                    "onUpdate": "CASCADE",
                    "onDelete": "CASCADE",
                    "references": {
                        "model": "chat_converse",
                        "key": "id"
                    },
                    "primaryKey": true
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "oauth_qq_access_info",
            {
                "id": {
                    "type": Sequelize.INTEGER,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "access_token": {
                    "type": Sequelize.STRING,
                    "field": "access_token",
                    "allowNull": false,
                    "required": true
                },
                "expires_in": {
                    "type": Sequelize.INTEGER,
                    "field": "expires_in",
                    "allowNull": false,
                    "required": true
                },
                "refresh_token": {
                    "type": Sequelize.STRING,
                    "field": "refresh_token",
                    "allowNull": false,
                    "required": true
                },
                "openid": {
                    "type": Sequelize.STRING,
                    "field": "openid",
                    "allowNull": false,
                    "required": true
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
                "relatedUserId": {
                    "type": Sequelize.INTEGER,
                    "field": "relatedUserId",
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
        fn: "createTable",
        params: [
            "actor_actor",
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
                    "require": true
                },
                "desc": {
                    "type": Sequelize.STRING,
                    "field": "desc"
                },
                "avatar": {
                    "type": Sequelize.STRING,
                    "field": "avatar"
                },
                "template_uuid": {
                    "type": Sequelize.STRING,
                    "field": "template_uuid",
                    "allowNull": false,
                    "required": true
                },
                "info": {
                    "type": Sequelize.JSON,
                    "field": "info"
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
    },
    {
        fn: "createTable",
        params: [
            "file_file",
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
                    "require": true
                },
                "originalname": {
                    "type": Sequelize.STRING,
                    "field": "originalname",
                    "require": true
                },
                "size": {
                    "type": Sequelize.INTEGER,
                    "field": "size",
                    "require": true
                },
                "encoding": {
                    "type": Sequelize.STRING,
                    "field": "encoding"
                },
                "mimetype": {
                    "type": Sequelize.STRING,
                    "field": "mimetype"
                },
                "ext": {
                    "type": Sequelize.STRING,
                    "field": "ext"
                },
                "type": {
                    "type": Sequelize.ENUM('file'),
                    "field": "type"
                },
                "can_preview": {
                    "type": Sequelize.BOOLEAN,
                    "field": "can_preview",
                    "defaultValue": false
                },
                "is_persistence": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_persistence",
                    "defaultValue": false
                },
                "is_expired": {
                    "type": Sequelize.BOOLEAN,
                    "field": "is_expired",
                    "defaultValue": false
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
    },
    {
        fn: "createTable",
        params: [
            "file_chatimg",
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
                    "require": true
                },
                "url": {
                    "type": Sequelize.STRING,
                    "field": "url"
                },
                "size": {
                    "type": Sequelize.INTEGER,
                    "field": "size",
                    "require": true
                },
                "width": {
                    "type": Sequelize.INTEGER,
                    "field": "width"
                },
                "height": {
                    "type": Sequelize.INTEGER,
                    "field": "height"
                },
                "type": {
                    "type": Sequelize.ENUM('file', 'url'),
                    "field": "type"
                },
                "has_thumbnail": {
                    "type": Sequelize.BOOLEAN,
                    "field": "has_thumbnail",
                    "defaultValue": false
                },
                "mimetype": {
                    "type": Sequelize.STRING,
                    "field": "mimetype"
                },
                "encoding": {
                    "type": Sequelize.STRING,
                    "field": "encoding"
                },
                "ext": {
                    "type": Sequelize.JSON,
                    "field": "ext"
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
    },
    {
        fn: "createTable",
        params: [
            "file_avatar",
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
                    "require": true
                },
                "size": {
                    "type": Sequelize.INTEGER,
                    "field": "size",
                    "require": true
                },
                "width": {
                    "type": Sequelize.INTEGER,
                    "field": "width"
                },
                "height": {
                    "type": Sequelize.INTEGER,
                    "field": "height"
                },
                "type": {
                    "type": Sequelize.ENUM('actor', 'user', 'group'),
                    "field": "type"
                },
                "has_thumbnail": {
                    "type": Sequelize.BOOLEAN,
                    "field": "has_thumbnail",
                    "defaultValue": false
                },
                "attach_uuid": {
                    "type": Sequelize.STRING,
                    "field": "attach_uuid"
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
    },
    {
        fn: "createTable",
        params: [
            "mail_list",
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
                    "allowNull": false,
                    "required": true
                },
                "email_address": {
                    "type": Sequelize.STRING,
                    "field": "email_address",
                    "allowNull": false,
                    "validate": {
                        "isEmail": true
                    },
                    "required": true
                },
                "email_user": {
                    "type": Sequelize.STRING,
                    "field": "email_user"
                },
                "email_provider": {
                    "type": Sequelize.STRING,
                    "field": "email_provider"
                },
                "enabled": {
                    "type": Sequelize.BOOLEAN,
                    "field": "enabled",
                    "defaultValue": false
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
    },
    {
        fn: "createTable",
        params: [
            "group_actor",
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
                "actor_uuid": {
                    "type": Sequelize.UUID,
                    "field": "actor_uuid"
                },
                "actor_info": {
                    "type": Sequelize.JSON,
                    "field": "actor_info"
                },
                "avatar": {
                    "type": Sequelize.TEXT,
                    "field": "avatar"
                },
                "passed": {
                    "type": Sequelize.BOOLEAN,
                    "field": "passed",
                    "defaultValue": false
                },
                "enabled": {
                    "type": Sequelize.BOOLEAN,
                    "field": "enabled",
                    "defaultValue": true
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
                },
                "actorId": {
                    "type": Sequelize.INTEGER,
                    "field": "actorId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "actor_actor",
                        "key": "id"
                    },
                    "allowNull": true
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
