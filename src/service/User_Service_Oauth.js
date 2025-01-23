// User_Service Sub Oauth Service Module
require('dotenv').config();

exports.request_token_social_github = async (request_code) => {

    try{
        // api 통신으로 토큰 발행
        // 필수 정보 post body 형식으로 제시
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
        const access_token = token_data.access_token;

        const user_response = await fetch('https://api.github.com/user',{
            headers : {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const user_data = await user_response.json();

        return user_data;

    }catch(err){

        console.log(" GitHub Connect Fail ");
        
        return null;
    }
};

exports.request_token_social_naver = async (request_code) => {

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

        const access_token = token_data.access_token;

        const user_response = await fetch('https://openapi.naver.com/v1/nid/me',{
            headers : {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const user_data = await user_response.json();

        if(user_data.message != 'success' ){
            throw new Error('Social Connect Fail');
        }

        return user_data.response;

    }catch(err){

        console.log(" Naver Connect Fail ");
        
        return null;
    }
};