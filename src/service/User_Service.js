// User_model.js
const bcrypt = require('bcrypt');
require('dotenv').config();
const { read_DB , write_DB } = require("../models/mysql_connect");
const redis_client = require('../models/redis_connect');
const data_utils = require('../utils/dataUtils');


// email, nickname used check
async function check_dup_userinfo(email, username = null){

    // return dup user ID, Email Count
    const query = `SELECT 
                        (SELECT COUNT(*) FROM User WHERE email = ?) AS dup_eamil, 
                        (SELECT COUNT(*) FROM User WHERE username = ?) AS dup_username`

    const read_DB_promise = read_DB.promise();

    try{
        const [check_user_result] = await read_DB_promise.query(query, [email, username]);

        return {
            dup_email : check_user_result[0].dup_eamil,
            dup_username : check_user_result[0].dup_username
        };

    }catch(err){
        // DB query process error catch
        console.error("(check_dup_userinfo) 쿼리 오류 발생 : ", err);
        return null;
    }
};

 
async function update_user_social_key(key_name, value, user_id) {
    // social name = social PK in User = id
    const query = `UPDATE User SET ${key_name} = ? WHERE id = ?`;

    // promise return type 
    const read_DB_promise = write_DB.promise();
    
    try{
        
        const [result] = await read_DB_promise.query(query,[value, user_id])

        // register success
        if(result.affectedRows){
            return true;
        }

        // fail
        return false;

    }catch(err){
        //DB update catch
        console.log("(update_user_social_key) 쿼리 오류 발생 : ", err);
        return true;
    }
    
};


async function del_redis_dup_user_session(user_id, sessionID) {
    try{
        //check dup access user session 
        const result_value = await redis_client.get(`user:${user_id}:session`);

        // dup session disconnect setting 
        if( result_value ){
            await redis_client.del(`user:${user_id}:session`);
            await redis_client.del(`user:${result_value}`);
        }

        // Redis login time setting 
        await redis_client.setEx(`user:${user_id}:session`, 1800, sessionID );

        

    }catch(err){
        // Redis process err catch
        console.log("( del_redis_dup_user_session ) Redis-cli : ", err );
    }
};


const User_model = {

    // 계정생성 
    set_createUser : async (req, signup_password, request, callback ) => {

        try{
            const dup_check_result = await check_dup_userinfo(req.session.sign.email, req.session.sign.username);

            if(dup_check_result.dup_email || dup_check_result.dup_username ){
        
                if(dup_check_result.dup_email){
                    delete req.session.sign.email;
                }
                if(dup_check_result.dup_username){
                    delete req.session.sign.username;
                }
                
                console.log("break 지점 : ", dup_check_result , req.session.sign);
                
                return callback(true, 'duplicated_user');
            } else {

                // DB 접속전 해쉬화 처리
                const salt = await bcrypt.genSalt(10); // salt 생성
                const hashedPassword = await bcrypt.hash(signup_password, salt);
                const query = `INSERT INTO User (username, email, nickname, password) VALUES ( ?, ?, ?, ?)`;

                write_DB.query(query, [ req.session.sign.username, req.session.sign.email, req.session.sign.nickname, hashedPassword ] , async (err, result) => {
                    if(err) {
                        // DB server error
                        console.error("insert error : " , err);
                        return callback(true, 'signup_request_fail');
                    }

                    const return_message = {
                        signup : 'ok'
                    };

                    if(request === 'auth_signup_request'){
                        return_message.social_signup = 'social_registering';
                        if(req.session.social.email === req.session.sign.email){
                            const social_connect = await update_user_social_key( req.session.social.social_key, req.session.social.id, result.insertId);
                            return_message.social_signup = social_connect;
                        }
                    }

                    // session initialize
                    req.session = '';

                    callback(false, new URLSearchParams(return_message).toString());
                });
            }
        }catch(err){
            // DB system err
            console.error("( set_createUser ) 쿼리 오류 발생 : ", err);
            callback(true, 'signup_request_fail');
        }
    },

    // 로그인 처리 return (string -> issue) 
    set_loginUser : async (req, callback , username = null, password = null, request = null) => {
        const read_DB_promise = read_DB.promise();

        try{
            /// setLogin_page -> process
            if (username){
                const query = `SELECT * FROM User WHERE username = ? `;
                //DB check
                const [ check_user_info ] = await read_DB_promise.query(query,[username]);
                
                if(!check_user_info.length){
                    callback(true,'login_fail');
                }else{
                    const match = await bcrypt.compare(password, check_user_info[0].password);
    
                    // 비밀번호 일치
                    if(match){

                        // register request check
                        if(request === 'auth_login_request'){
                            // 이미 가입된 경우
                            if(check_user_info[0][req.session.social.social_key]){
                                return callback(true, 'already_key');
                            }
                            
                            // social key register
                            if(req.session.social){
                                if(req.session.social.email === check_user_info[0].email ){
                                    
                                    const social_connect = await update_user_social_key( req.session.social.social_key, req.session.social.id, check_user_info[0].id);
        
                                    if(!social_connect){
                                        // 소셜연동 실패 ( 반환 false) 
                                        req.session.social = null;
                                        console.log("User_model, 147line : Update query err")
                                        return callback(true,'Server account update error');
                                    }
                                } else{
                                    // 이메일이 불일치 
                                    // email inconsistency
                                    return callback(true,'email_inconsistency');
                                }
                            }
                        }

                        delete req.session.social; // 세션정리

                        //disconnect dup_user_session && create redis key
                        del_redis_dup_user_session(check_user_info[0].id, req.sessionID);

                        // check in
                        req.session.user = {
                            user_id : check_user_info[0].id,
                            nickname : check_user_info[0].nickname
                        };

                        

                        callback(false,'access');
                    } else {
                        // password inconsistency
                        callback(true,'login_fail');
                    }
                }
            }else{
                /// setSocialLogin -> process
                // social login access define
                // used email status

                const query = `select id, nickname from User where email = ? and ${ req.session.social.social_key } = ? `;
                
                //User_DB query 
                const [ check_user_info ] = await read_DB_promise.query(query,[req.session.social.email, req.session.social.id]);
            
                
                // registered social_user login 
                if(check_user_info.length){
                    req.session.social = null;

                    //disconnect dup_user_session && create redis key
                    del_redis_dup_user_session(check_user_info[0].id, req.sessionID);

                    // check in
                    req.session.user = {
                        user_id : check_user_info[0].id,
                        nickname : check_user_info[0].nickname
                    };
                    
                    callback(false,'access');
                }else{
                    // 해당 소셜이 등록된 계정 없음
                    // 계정 연동 권유 
                    callback(true,'auth_login_request');
                }
            }
        }catch(err){
            // 시스템 에러 
            console.error(" ( set_loginUser )  : 로그인 처리 에러 ", err);
            callback(true,'login_request_fail');
        }
    },

    get_userinfo : ( user_id , callback ) => {
        const query = `select id, nickname from User where id = ?`;

        read_DB.query(query, [user_id] ,(err, result) => {
            if(!result || err){
                return callback(err, result);
            }

            callback(null, result[0]);
        });
    },

    get_userinfo_post : ( user_id, limit, offset, callback ) => {
        const query = `select * from Content where user_id = ? and visible = 1 limit ? offset ?`;

        read_DB.query(query, [user_id, limit, offset] ,(err, result) => {
            if(err){
                return callback(err, null);
            }
            
            result = data_utils.content_type_string(result);
            
            result.forEach(row => {
                row.date_now = data_utils.date_before(row.date_create);
            });

            callback(null, result);
        });
    },
    
    get_userinfo_activity : ( user_id, limit, offset, callback ) => {
        const query = `
            SELECT A.*, User.nickname FROM
            ( SELECT Post.comment AS comment, Post.create_at AS comment_create_at, Content.id AS content_id, Content.user_id AS content_user_id, Content.content_type AS content_type FROM 
            ( SELECT * FROM Comment where user_id = ? and visible = 1 limit ? offset ?) Post LEFT JOIN Content ON Post.content_id = Content.id ) 
            A LEFT JOIN User ON A.content_user_id  = User.id;
        `;

        read_DB.query(query, [user_id,  limit, offset] ,(err, result) => {
            if(err){
                return callback(err,null);
            }

            result = data_utils.content_type_string(result);

            result.forEach(row => {
                row.date_now = data_utils.date_before(row.comment_create_at);
            });

            callback(null, result);
        });
    },

    // social auth request url create
    request_auth_social : ( social_type , callback ) => {

        if( social_type === "github"){
            const authUrl_github = 'https://github.com/login/oauth/authorize';

            //연동 과정 연동 설정 쿼리 스트링으로 제시
            const config_info = {
                client_id : process.env.GITHUB_CLIENT_ID,
                allow_signup : false,
                scope : "user:email"
            }
            const url_params = new URLSearchParams(config_info).toString();
        
            callback(`${authUrl_github}?${url_params}`);

        } else if(social_type === "naver"){
            const authUrl_naver = 'https://nid.naver.com/oauth2.0/authorize';

            const config_info = {
                response_type : 'code',
                client_id : process.env.NAVER_CLIENT_ID,
                redirect_uri : process.env.DOMAIN + '/login/naver/callback',
                state: process.env.NAVER_CLIENT_STATE
            }

            const url_params = new URLSearchParams(config_info).toString();

            callback(`${authUrl_naver}?${url_params}`);
        }else{
            // error
            callback('back');
        }
    },

    //Social Login Token request
    request_token_social : async (req, callback) => {

        const request_code = req.query.code;
        const social_type = req.params.social_url;

        const Oauth_modul_object = require('./User_Service_Oauth');

        try{

            // Social token request
            if(social_type === 'github'){
                var user_data = await Oauth_modul_object.request_token_social_github(request_code);
            } else if ( social_type === 'naver'){
                if( req.query.error ){
                    console.log("( request_token_social ) social_type 체크 에러 : ", req.query.error_description);
                    return callback(true, "Social Access Fail");
                }
                var user_data = await Oauth_modul_object.request_token_social_naver(request_code);
            } else {
                console.log("( request_token_social ) social_type 체크 에러  : 존재하지 않는 소셜 정보");
                return callback(true, "Social Access Fail");
            }
            
            // social email duplicated check
            const dup_email_check = await check_dup_userinfo(user_data.email);

            // 회원가입용 임시 세션 저장
            req.session.social = {
                id : user_data.id,
                email : user_data.email,
                social_key : "key_" + social_type
            }

            // 이미 존재하는 이메일인 경우
            if(dup_email_check.dup_email){
                // 로그인 시도 
                User_model.set_loginUser(req,(status, issue) => {
                    if(issue === 'access' ){
                        // 로그인 완료
                        callback(status, issue);
                    }else if (issue === 'auth_login_request') {
                        // 계정 연동 권유
                        callback(status, issue);
                    }else{ 
                        // 시스템적 예외 처리
                        callback(status, issue);
                    }
                });
            }else{
                //new user create 유저 post 처리 필요
                callback(true,"auth_signup_request");
            }

        }catch(err){
            // 소셜 토큰 에러
            console.log(err);
            callback(true, err);
        }
    },

    get_Setting_Social : (user_id, callback) => {
        const query = `SELECT key_github, key_naver FROM User WHERE id = ?`;

        read_DB.query(query,[user_id],( err, results ) => {

            if(err){
                return callback(err, null);
            }
            

            callback(null,results);
        });
    },
    get_Setting_user_info : (user_id, callback) => {
        const query = `SELECT username, email FROM User WHERE id = ?`;

        read_DB.query(query,[user_id],( err, results ) => {
            if(err){
                return callback(err, null);
            }

            callback(err,results)
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
                return callback(403, "잘못된 접근으로, 문제가 발생했습니다.");
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

            callback(403, "잘못된 접근으로, 문제가 발생했습니다.");

        }catch(err){
            console.error("(put_Password_change) catch 발생 : ",err);
            callback(500, "요청을 처리하는 도중, 문제가 발생했습니다.");
        }
    }
};

module.exports = User_model