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

    /** 일반 로그인 처리  */ 
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

    /** 소셜 로그인 처리 new*/ 
    set_social_login : async ( req, callback ) => {
        const request_code = req.query.code;  // 인가 코드
        const social_type = req.params.social_url; // 소셜 위치 
        const social_key = 'key_' + social_type;
        try{ 

            const { reuslt, social_data } = await Oauth_module.request_token_social( social_type, request_code ); // { result , data };
            const existingUser = await Oauth_module.find_social_user( social_data.id, social_key);

            // 소셜 등록
            if(!!req.session.user){

                if(existingUser
                    && existingUser.id !== req.session.user.user_id){
                    return callback(409, 'register', "이미 연동된 소셜 계정입니다. ");
                }

                const handle_social_register = await Oauth_module.update_user_social_key( social_key, social_data.id, req.session.user.user_id);
                if(!handle_social_register){
                    throw { status : 500, message : " (update_user_social_key) 데이터베이스 처리 중, 문제가 발생했습니다." }
                }

                return callback(null, 'register', "소셜 계정 연동이 완료되었습니다.");
            }

            /// 일반 로그인 

            // 회원가입 필요
            if(!existingUser){
                req.session.social = {
                    id : social_data.id,
                    email : social_data.email,
                    social_key
                }
                
                return callback(null,'signup', null);
            }

            req.session.user = {
                user_id : existingUser.id,
                nickname : existingUser.nickname
            };

            callback(null,'login',null);

        }catch(err){
            console.error( ` ( set_social_login ) 소셜 연결 : ${err.message}` );
            return callback( err.status || 500, null, null);
        }
    },


    /** 회원가입 처리 (소셜 등록 체크) */
    set_signup : async ( req, callback ) => {
        const sign_username = req.body.username;
        const sign_nickname = req.body.nickname;
        const sign_email = req.body.email;
        const sign_password = req.body.password; 

        try{
            const dup_check_result = await check_dup_userinfo( sign_username, sign_nickname, sign_email );

            // 중복결과 체크
            const duplicaion_check = Object.values(dup_check_result.duplicates).some( row => parseInt(row));

            // 중복 결과를 key:value 로 반환
            if(duplicaion_check){
                const dup_list = Object.entries(dup_check_result.message)
                    .filter(([_,msg]) => msg !== null)
                    .reduce((list,[key, value]) => {
                        list[key] = value;
                        return list;
                    },{});

                return callback(409, "중복되는 정보가 존재", dup_list);
            }

            // 회원가입 처리
            const salt = await bcrypt.genSalt(10); // salt 생성
            const hashedPassword = await bcrypt.hash(sign_password, salt);

            const query = `INSERT INTO User (username, email, nickname, password) VALUES ( ?, ?, ?, ? )`;
            const [ insert_query_result ] = await read_DB_promise.query(query, [ sign_username, sign_email, sign_nickname, hashedPassword]);
            if(!insert_query_result.affectedRows){
                // 사용자 입력 정보 미흡
                console.log( ` (set_signup) INSERT 영향 없음 : ${username}, ${email}, ${nickname} `);
                return callback(400, "회원가입 처리를 완료하지 못했습니다. 다시 시도해주세요.", null);
            }

            // 소셜 연동 처리
            if( req.session.social ){
                const request_info = req.session.social;
                delete req.session.social;
                Oauth_module.update_user_social_key(request_info.social_key, request_info.id, insert_query_result.insertId );
            }

            callback(null, "회원가입 완료", null);
        }catch(err){
            console.error( "( set_signup ) : \n",err.stack);
            callback( 500, "서버에서 요청을 처리하지 못했습니다.", null);
        }
    },


};


module.exports = auth_service_object;