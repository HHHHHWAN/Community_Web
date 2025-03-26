// User_Service Sub Oauth Service Module
require('dotenv').config();
const read_DB = require('../models/mysql_connect').read_DB;
const read_DB_promise = read_DB.promise();

/**  GitHub Oauth */
const request_token_social_github = async (request_code) => {

    try{
        // 접근 토근 요청
        const token_response = await fetch('https://github.com/login/oauth/access_token',{
            method : 'POST',
            headers : {
                'Content-type' : 'application/json',
                'Accept': 'application/json'
            },
            body : JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret : process.env.GITHUB_CLIENT_SECRET,
                code : request_code,
                redirect_uri : `${process.env.DOMAIN}/login/github/callback`,
            }),
        });
    
        const token_data = await token_response.json();

        if(!token_response.ok){
            // 인가 토큰 요청 실패
            throw new Error("유효하지 않는 접근 요청");
        }

        const access_token = token_data.access_token;

        const user_response = await fetch('https://api.github.com/user',{
            headers : {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const user_data = await user_response.json();

        if(!user_response.ok){
            throw new Error(user_response);
        }

        return {result : true , social_data : user_data};

    }catch(err){
        console.error("( request_token_social_github ) : \n", err.stack);
        return {result : false , social_data : null};
    }
};


/**  Naver Oauth */ 
const request_token_social_naver = async (request_code) => {

    try{
        // 접근 토근 요청
        const token_response = await fetch('https://nid.naver.com/oauth2.0/token',{
            method : 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
            },
            body : new URLSearchParams({
                grant_type : 'authorization_code', 
                client_id : process.env.NAVER_CLIENT_ID,
                client_secret : process.env.NAVER_CLIENT_SECRET,
                code : request_code,
                state : process.env.NAVER_CLIENT_STATE,
            }),
        });
        
        const token_data = await token_response.json();

        if(!token_response.ok){            
            // 인가 토큰 요청 실패
            throw new Error("유효하지 않는 접근 요청");
        }

        const access_token = token_data.access_token;

        const user_response = await fetch('https://openapi.naver.com/v1/nid/me',{
            headers : {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const user_data = await user_response.json();

        if(user_data.message !== 'success' ){
            throw new Error("소셜 사용자 인증 실패");
        }

        return {result : true , social_data : user_data.response};

    }catch(err){
        console.error(" ( request_token_social_naver ) : \n", err.stack);
        return {result : false , social_data : null};
    }
};

/** 소셜 접근 토큰 요청 -> 유저 정보 반환 */ 
exports.request_token_social = async ( social, request_code ) => {
    let Oauth_result = null;
    switch(social){
        case 'github' :
            Oauth_result = await request_token_social_github(request_code);
            break;
        case 'naver' :
            Oauth_result = await request_token_social_naver(request_code);
            break;
        default :
            Oauth_result = { result : false, social_data : null };
    }

    if(!Oauth_result.result){
        throw { status : 403, message : '소셜 인증 처리 중, 문제가 발생했습니다.'}    
    }

    return Oauth_result;
};

/** 소셜 연동 여부 체크  ( 검색 ROW 반환 ) */
exports.find_social_user =  async ( social_id, social_key ) => {   
    const query = `
    SELECT id, nickname 
    FROM User 
    WHERE visible = 1 AND ${social_key} = ?`;

    try{
        const [ result_rows ] = await read_DB_promise.query(query,[social_id]);

        return result_rows[0] || null;
    }catch(err){
        console.error(" ( set_social_login ) MySql2 : \n ", err.stack);
        throw { status : 500, message : "(find_social_user) 데이터베이스 처리 중, 문제가 발생했습니다."}
    }
};

/** 소셜 id 등록 */
exports.update_user_social_key =  async ( social_key, social_id, user_id) => {
    
    const query = `UPDATE User SET ${social_key} = ? WHERE id = ?`;

    try{

        const [DB_result] = await read_DB_promise.query(query,[social_id, user_id]);

        if(!DB_result.affectedRows){
            console.error(` ( 연동 실패 ) 소셜: \n${social_key} \n유저 ID: ${user_id} \n 변동 레코드 : ${DB_result.affectedRows}`);
            throw " 소셜 계정 연동되는 대상 없음 ";
        }

        return true;
    }catch(err){
        console.error("(update_user_social_key) 에러 : ", err);
        return false;
    }
};

