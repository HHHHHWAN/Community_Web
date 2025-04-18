// User_model.js
const bcrypt = require('bcrypt');
require('dotenv').config();
const { read_DB , write_DB } = require("../models/mysql_connect");
// const redis_client = require('../models/redis_connect');
const data_utils = require('../utils/dataUtils');


const user_get_service = {

        // 유저 정보 반환
        get_userinfo : ( user_id , callback ) => {
            const query = `SELECT id, nickname FROM User WHERE id = ?`;
    
            read_DB.query(query, [user_id] ,(err, result) => {
                if(err){
                    console.error("( getUserinfo => get_userinfo ) ", err.stack);
                    return callback(500, null);
                }
    
                if(!result.length){
                    return callback(404, null);
                }
    
                callback(null, result[0]);
            });
        },

        // 유저 포스팅 정보 
        get_userinfo_post : ( user_id, limit, offset, callback ) => {
            const query = `SELECT * FROM Content WHERE user_id = ? AND visible = 1 LIMIT ? OFFSET ?`;
    
            read_DB.query(query, [user_id, limit, offset] ,(err, DB_results) => {
                if(err){
                    console.error("( getUserinfo => get_userinfo_post ) : \n" ,err.stack);
                    return callback(500, null);
                }
                
                DB_results = data_utils.content_type_string(DB_results);
                
                DB_results.forEach(row => {
                    row.date_now = data_utils.date_before(row.create_at);
                });
    
                callback(null, DB_results);
            });
        },
        
        // 유저 활동 정보
        get_userinfo_activity : ( user_id, limit, offset, callback ) => {
            const query = `
                SELECT A.*, User.nickname 
                FROM    (SELECT Post.comment AS comment, 
                            Post.create_at AS comment_create_at, 
                            Content.id AS content_id, 
                            Content.user_id AS content_user_id, 
                            Content.content_type AS content_type 
                        FROM ( SELECT * 
                            FROM Comment 
                            where user_id = ? AND visible = 1 
                            LIMIT ? OFFSET ?) Post 
                        LEFT JOIN Content ON Post.content_id = Content.id) 
                A LEFT JOIN User ON A.content_user_id  = User.id;
            `;
    
            // 리스트 출력
            read_DB.query(query, [user_id,  limit, offset] ,(err, DB_results) => {
                if(err){
                    console.error("( getUserinfo => get_userinfo_activity ) : \n" , err.stack);
                    return callback(500, null);
                }
    
                DB_results = data_utils.content_type_string(DB_results);
    
                DB_results.forEach(row => {
                    row.date_now = data_utils.date_before(row.comment_create_at);
                });
    
                callback(null, DB_results);
            });
        },

        get_Nickname : (search_nickname, callback ) => {
            const query = `SELECT nickname FROM User WHERE nickname = ?`;
            read_DB.query(query, [search_nickname], (err, result) => {
                if(err){
                    console.error("( get_Nickname ) : \n" , err.stack);
                    return callback(err, null);
                }
                callback(null, result);
            });
        },
    
        /** 회원 정보 DOM 데이터 -> api_getSettinginfo */
        get_Setting_user_info : (user_id, callback) => {
            const query = `SELECT username, email, nickname FROM User WHERE id = ?`;
    
            read_DB.query(query,[ user_id ],( err, DB_results ) => {
                if(err){
                    return callback(err, null);
                }
    
                callback(err, DB_results)
            });
        },
    
        /** 소셜 연동 현황 -> api_getSettingConfig */
        get_Setting_Social : (user_id, callback) => {
            const query = `SELECT 
                CASE 
                    WHEN key_github IS NULL THEN FALSE
                    ELSE
                        TRUE
                    END AS key_github,
                CASE
                    WHEN key_naver IS NULL THEN FALSE
                    ELSE
                        TRUE
                END AS key_naver
                FROM User WHERE id = ?`;
    
            read_DB.query(query,[user_id],( err, DB_results ) => {
                if(err){
                    return callback(err, null);
                }
                
                callback(null, DB_results);
            });
        },

        /** 북마크 기록 확인 */
        get_Bookmark_info : (content_id, user_id, callback ) => {
            const query = `
            SELECT *
            FROM Bookmark
            WHERE content_id = ? AND User_id = ?`;

            read_DB.query(query, [ content_id, user_id ], ( err, DB_result ) => {
                if(err){
                    console.error("( get_Bookmark_info ) : \n" , err.stack);
                    return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
                }

                callback(null, DB_result.length);
            });
        },

        /** 북마크 기록 리스트 출력 */
        get_Bookmark_list : ( user_id, limit, offset, callback ) => {
            const query = `
            SELECT Content.id, Content.title, Content.user_id,
                    Content.content_type, User.nickname, Bookmark.create_at 
            FROM Bookmark
            JOIN Content ON Bookmark.content_id = Content.id 
            JOIN User ON Content.user_id = User.id
            WHERE Bookmark.user_id = ? 
                AND Content.visible = 1
            ORDER BY Bookmark.create_at DESC
            LIMIT ? OFFSET ?`;

            read_DB.query(query, [ user_id, limit, offset ], ( err, DB_result ) => {
                if(err){
                    console.error("( get_Bookmark_list ) : \n" , err.stack);
                    return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
                }

                DB_result = data_utils.content_type_string(DB_result);
                DB_result.forEach(row => {
                    row.date_now = data_utils.date_before(row.create_at);
                });
    

                callback(null, DB_result);
            });
            
        }

};


module.exports = user_get_service;