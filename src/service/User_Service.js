// User_model.js
const bcrypt = require('bcrypt');
require('dotenv').config();
const { read_DB , write_DB } = require("../models/mysql_connect");
// const redis_client = require('../models/redis_connect');
const data_utils = require('../utils/dataUtils');




const User_model = {

    // 유저 정보 반환
    get_userinfo : ( user_id , callback ) => {
        const query = `SELECT id, nickname FROM User WHERE id = ?`;

        read_DB.query(query, [user_id] ,(err, result) => {
            if(err){
                console.error("( getUserinfo => get_userinfo ) ", err.stack);
                return callback(500, null);
            }

            if(!result.length){
                return callback(400, null);
            }

            callback(null, result[0]);
        });
    },

    get_userinfo_post : ( user_id, limit, offset, callback ) => {
        const query = `SELECT * FROM Content WHERE user_id = ? AND visible = 1 LIMIT ? OFFSET ?`;

        read_DB.query(query, [user_id, limit, offset] ,(err, DB_results) => {
            if(err){
                console.error("( getUserinfo => get_userinfo_post ) : \n" ,err.stack);
                return callback(500, null);
            }
            
            DB_results = data_utils.content_type_string(DB_results);
            
            DB_results.forEach(row => {
                row.date_now = data_utils.date_before(row.date_create);
            });

            callback(null, DB_results);
        });
    },
    
    get_userinfo_activity : ( user_id, limit, offset, callback ) => {
        const query = `
            SELECT A.*, User.nickname FROM
            ( SELECT Post.comment AS comment, Post.create_at AS comment_create_at, Content.id AS content_id, Content.user_id AS content_user_id, Content.content_type AS content_type FROM 
            ( SELECT * FROM Comment where user_id = ? and visible = 1 limit ? offset ?) Post LEFT JOIN Content ON Post.content_id = Content.id ) 
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

    // 회원 정보 DOM 데이터 -> api_getSettinginfo
    get_Setting_user_info : (user_id, callback) => {
        const query = `SELECT username, email FROM User WHERE id = ?`;

        read_DB.query(query,[ user_id ],( err, DB_results ) => {
            if(err){
                return callback(err, null);
            }

            callback(err, DB_results)
        });
    },

    // 소셜 연동 현황 -> api_getSettingConfig
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



    put_Setting_Nickname : ( user_id, input_nickname, callback) => {
        const query = `UPDATE User SET nickname = ? WHERE id = ?`;

        write_DB.query(query, [ input_nickname, user_id ], ( err, result ) => {
            if(err){
                console.error("( set_Setting_Nickname ) 에러 : ", err);
                return callback(err);
            }

            if(!result.affectedRows){
                console.error("( set_Setting_Nickname ) 닉네임 변경 시도, 영향 받은 레코드 존재하지 않음");
                console.log("요청 데이터 <user_id, input_nickname > : (",user_id,",",input_nickname,")");

                return callback(true);
            }

            callback(null);
        });
    },

    get_Nickname : (search_nickname, callback ) => {
        const query = `SELECT nickname FROM User WHERE nickname = ?`;
        read_DB.query(query, [search_nickname], (err, result) => {
            if(err){
                return callback(err, null);
            }
            callback(null, result);
        });
    },


    put_Social_Unconnect : ( user_id, social_key , callback ) => {
        const query = `UPDATE User SET ${social_key} = NULL WHERE id = ?`;

        write_DB.query(query, [ user_id ], (err, result) => {

            if(err){
                return callback(err);
            }

            if(!result.affectedRows){
                console.error("( put_Social_Unconnect ) 소셜 해제 변경 시도, 영향 받은 레코드 존재하지 않음");
                console.log("요청 데이터 <user_id, social_key > : (",user_id,",",social_key,")");

                return callback(true);
            }

            callback(null);
        });
    },

    put_Password_change :  async ( user_id, current_password, new_password , callback ) => {
        const read_DB_promise = read_DB.promise();
        const write_DB_promise = write_DB.promise();

        const select_query = `SELECT * FROM User WHERE id = ?`;
        const update_query = `UPDATE User SET password = ? WHERE id=?`;

        try{
            const [select_result] = await read_DB_promise.query(select_query,[user_id]);

            if(!select_result.length){
                return callback(404, "잘못된 접근으로, 문제가 발생했습니다.");
            }

            if(!await bcrypt.compare(current_password, select_result[0].password)){
                return callback(401, "현재 비밀번호가 불일치 합니다.");
            }

            const salt = await bcrypt.genSalt(10); // salt 생성
            const hashedPassword = await bcrypt.hash(new_password, salt);

            const [update_result] = await write_DB_promise.query(update_query,[hashedPassword, user_id]);

            if(update_result.affectedRows > 0 ){
                return callback(false, "비밀번호 변경이 완료되었습니다.");
            }

            callback(404, "잘못된 접근으로, 문제가 발생했습니다.");

        }catch(err){
            console.error("(put_Password_change) catch 발생 : ",err);
            callback(500, "요청을 처리하는 도중, 문제가 발생했습니다.");
        }
    }
};

module.exports = User_model