const bcrypt = require('bcrypt');
require('dotenv').config();

// const data_utils = require('../utils/dataUtils');

// DB object
const { read_DB , write_DB } = require("../models/mysql_connect");
const redis_client = require('../models/redis_connect');
const read_DB_promise = read_DB.promise();


const Oauth_module = require('./Oauth_service');

/** 유저 아이디, 닉네임, 이메일 중복 체크 */ 
const check_dup_userinfo = async (username, nickname, email) => {

    // return dup user ID, Email, nickname
    const query = `
    SELECT 
        SUM( username = ? ) AS username,
        SUM( nickname = ? ) AS nickname,
        SUM( email = ? ) AS email
    FROM User`;


    const [ query_result ] = await read_DB_promise.query(query, [ username, nickname, email ]);

    return {
        duplicates : query_result[0],
        message : {
            username : query_result[0].username > 0 ? "사용중인 아이디입니다." : null,
            nickname : query_result[0].nickname > 0 ? "사용중인 닉네임입니다." : null,
            email : query_result[0].email > 0 ? "사용중인 이메일입니다." : null 
        }
    };
};

 


/** 중복 로그인 처리  */
const del_redis_dup_user_session = async (user_id, new_sessionID) => {
    try{
        if(!redis_client.isReady){
            // redis cli 종료상태
            return
        }

        // 해당 계정으로 접속된 세션 확인
        const redis_result = await redis_client.get(`user:${user_id}:session`);

        // 중복 로그인 세션 강제 종료
        if( redis_result ){
            redis_client.del(`user:${user_id}:session`);
            redis_client.del(`user:${redis_result}`);
        }

        // Redis 중복체크용 데이터 적재
        redis_client.setEx(`user:${user_id}:session`, 1800, new_sessionID );

    }catch(err){
        console.error("( del_redis_dup_user_session ) Redis-cli : ", err.stack );
    }
};



/// auth Service -----------------------------------------------------------------------------------------------------

const auth_service_object = {

    // 로그인 처리 
    set_login : async ( req, input_username, input_password, callback ) => {
        
        const query = `
        SELECT id, nickname, visible, password
        FROM User 
        WHERE username = ?`;

        try{
            const [ DB_result ] = await read_DB_promise.query(query,[input_username]);

            // 아이디 검증
            if(!DB_result.length){
                return callback(401, "아이디 또는 비밀번호가 일치하지 않습니다.");
            }

            const user_info = DB_result[0];
            const match = await bcrypt.compare(input_password, user_info.password);

            // 비밀번호 검증
            if(!match){
                return callback(401, "아이디 또는 비밀번호가 일치하지 않습니다.");
            }

            if( user_info.visible.toString('hex') === '00' ){
                return callback(403, "회원탈퇴 처리된 아이디입니다.");
            }

            // 중복 로그인 방지 
            del_redis_dup_user_session(user_info.id, req.sessionID);

            // 세션 등록, 로그인 처리
            req.session.user = {
                user_id : user_info.id,
                nickname : user_info.nickname
            };

            callback(null,'처리 완료');
            
        }catch(err){
            // 시스템 에러 ( DB 처리 문제 )
            console.error(" ( set_loginUser )  : ", err.stack);
            callback(500, "서버에서 요청을 처리하지 못했습니다.");
        }
    },

    // 소셜 로그인 요청 
    get_social_oauth : ( social_type , callback ) => {

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

    // 소셜 로그인 처리
    set_social_login : async ( req, callback ) => {
        const request_code = req.query.code;  // 인가 코드
        const social_type = req.params.social_url; // 소셜 위치 
        const social_key = 'key_' + social_type;

        const Oauth_result = await Oauth_module.request_token_social( social_type, request_code ); // { result , data };

        // 인증 실패
        if(!Oauth_result.result){
            return callback(403, null);
        }

        const Oauth_userInfo = Oauth_result.data;

        const query = `
        SELECT id, nickname 
        FROM User 
        WHERE visible = 1 AND ${social_key} = ?`;
        
        read_DB.query(query, [Oauth_userInfo.id], ( err, query_result ) => {
            if(err){
                console.error(" ( set_social_login ) MySql2 : \n ", err.stack);
                return callback(500,null)
            }

            // 회원가입 필요
            if(!query_result.length){
                req.session.social = {
                    id : Oauth_userInfo.id,
                    email : Oauth_userInfo.email,
                    social_key
                }
                
                return callback(null,'/signup');
            }

            const user_info = query_result[0];

            req.session.user = {
                user_id : user_info.id,
                nickname : user_info.nickname
            };

            callback(null,'/');
        });
    },


    /// -----------------------------------------------test

    // 계정생성 OLD
    set_createUser : async (req, sign_password, request, callback ) => {

        try{
            const dup_check_result = await check_dup_userinfo(req.session.sign.email, req.session.sign.username);

            if(dup_check_result.dup_email || dup_check_result.dup_username ){
        
                if(dup_check_result.dup_email){
                    delete req.session.sign.email;
                }
                if(dup_check_result.dup_username){
                    delete req.session.sign.username;
                }
                
                
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

    /** 회원가입 처리 */
    set_signup : async ( req, sign_password, callback ) => {
        const sign_username = req.body.username;
        const sign_nickname = req.body.nickname;
        const sign_email = req.body.email;

        try{
            const dup_check_result = await check_dup_userinfo( sign_username, sign_nickname, sign_email );

            // 중복결과 체크
            const duplicaion_check = Object.values(dup_check_result.duplicates).some( row => parseInt(row));

            if(duplicaion_check){
                const dup_list = Object.entries(dup_check_result.message)
                    .filter(([_,msg]) => msg !== null)
                    .reduce((list,[key, value]) => {
                        list[key] = value;
                        return list;
                    },{});

                return callback(409, "중복되는 정보가 존재", dup_list);
            }

            const salt = await bcrypt.genSalt(10); // salt 생성
            const hashedPassword = await bcrypt.hash(sign_password, salt);

            const query = `INSERT INTO User (username, email, nickname, password) VALUES ( ?, ?, ?, ? )`;

            const [ insert_query_result ] = await read_DB_promise.query(query, [ sign_username, sign_email, sign_nickname, hashedPassword]);

            if(!insert_query_result.affectedRows){
                console.log( ` (set_signup) INSERT 영향 없음 : ${username}, ${email}, ${nickname} `);
                return callback(400, "회원가입 처리를 완료하지 못했습니다. 다시 시도해주세요.", null);
            }

            // 소셜 연동 기록
            if( req.session.social ){
                const request_info = req.session.social;
                delete req.session.social;
                Oauth_module.update_user_social_key(request_info.social_key, request_info.id, result.insertId );
            }

            callback(null, "회원가입 완료", null);

        }catch(err){
            console.error( "( set_signup ) : \n",err.stack);
            callback( 500, "서버에서 요청을 처리하지 못했습니다.", null);
        }
    },


};


module.exports = auth_service_object;