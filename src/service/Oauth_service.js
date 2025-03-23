// User_Service Sub Oauth Service Module
require('dotenv').config();
const read_DB = require('../models/mysql_connect').read_DB;
const read_DB_promise = read_DB.promise();

const request_token_social_github = async (request_code) => {

    try{
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

        return {result : true , data : user_data};

    }catch(err){
        console.error("( request_token_social_github ) : \n", err.stack);
        return {result : false , data : null};
    }
};

const request_token_social_naver = async (request_code) => {

    try{
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

        return {result : true , data : user_data.response};

    }catch(err){
        console.error(" ( request_token_social_naver ) : \n", err.stack);
        return {result : false , data : null};
    }
};


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
            Oauth_result = { result : false, data : null};
    }

    return Oauth_result;
};

//소셜 등록
exports.update_user_social_key = async ( social_key, key, user_id) => {
    
    const query = `UPDATE User SET ${key_name} = ? WHERE id = ?`;
    
    try{
        
        const [result] = await read_DB_promise.query(query,[value, user_id])

        // register success
        if(result.affectedRows){
            return true;
        }
        console.log(` ( 연동 실패 ) 소셜: \n${social_key} \n유저 ID: ${user_id} \n 변동레코드 : ${result.affectedRows}`);

        // fail
        return false;

    }catch(err){
        //DB update catch
        console.error("(update_user_social_key) 쿼리 오류 발생 : ", err);
        return true;
    }
    
};