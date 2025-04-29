// User_model.js
const bcrypt = require('bcrypt');
require('dotenv').config();
const { read_DB , write_DB } = require("../models/mysql_connect");
// const redis_client = require('../models/redis_connect');
// const data_utils = require('../utils/dataUtils');



const user_set_service = {

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
                return callback(400, "잘못된 요청 방식으로, 문제가 발생했습니다.");
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

            callback(400, "잘못된 요청 방식으로, 문제가 발생했습니다.");

        }catch(err){
            console.error("(put_Password_change) catch 발생 : ",err);
            callback(500, "요청을 처리하는 도중, 문제가 발생했습니다.");
        }
    },



    // 계정 비활성화
    set_invisibly_user : (user_id, callback) => {
        const query = `UPDATE User SET visible = b'0', delete_at = ?, key_github = NULL, key_naver = NULL  WHERE id = ?`;
        write_DB.query(query, [new Date, user_id] , (err, result) => {
            if(err){
                console.error( " ( set_invisibly_user ) Error : ", err);
                return callback(500,null);
            }


            if(!result.affectedRows){
                console.error(" ( set_invisibly_user ) status (400) 시도 :\n",`request_id : ${ user_id }`);
                return callback(400, "잘못된 요청 방식으로, 문제가 발생했습니다.");
            }


            callback(null,null); /// 정상 처리
        });
    },

    //** 북마크 */
    set_Bookmark_info : (content_id, user_id, callback ) => {
        const query = `INSERT INTO Bookmark (content_id, user_id) VALUES ( ?, ?)`;

        write_DB.query(query, [ content_id, user_id ], ( err, DB_result ) => {
            if(err){
                console.error( " ( set_Bookmark_info ) Error : ", err);
                return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
            }

            callback(null,DB_result.affectedRows);
        });
    },

    //** 북마크 해제 */
    del_Bookmark_info : (content_id, user_id, callback ) => {
        const query = `DELETE FROM Bookmark WHERE content_id = ? AND user_id = ?`;

        write_DB.query(query, [ content_id, user_id ], ( err, DB_result ) => {
            if(err){
                console.error( " ( del_Bookmark_info ) Error : ", err);
                return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
            }

            callback(null,DB_result.affectedRows);
        });
    },


    set_Like_info : ( target_type, target_id, user_id, callback ) => {
        const query = `INSERT INTO \`Like\` ( target_type, target_id, user_id ) VALUES ( ?, ?, ?)`;

        write_DB.query(query, [target_type, target_id, user_id], ( err, DB_result ) => {
            if(err){
                console.error( " ( set_Like_info ) Error : ", err);
                return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
            }

            callback(null, DB_result.affectedRows);
        });
    },

    del_Like_info : ( target_type, target_id, user_id, callback ) => {
        const query = `
        DELETE FROM \`Like\` 
        WHERE target_type = ? AND target_id = ? AND user_id = ?`;

        write_DB.query(query, [target_type, target_id, user_id], ( err, DB_result ) => {
            if(err){
                console.error( " ( set_Like_info ) Error : ", err);
                return callback(500, "서버에서 처리 중, 문제가 발생했습니다.");
            }

            callback(null, DB_result.affectedRows);
        });
    },

};

module.exports = user_set_service;