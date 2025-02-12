// User_Service Sub Oauth Service Module
require('dotenv').config();

exports.request_token_social_github = async (request_code) => {

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
            throw new Error(token_response);
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

        return user_data;

    }catch(err){

        console.error("( request_token_social )  GitHub Connect Fail \n", err);
        
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

        if(!token_response.ok){
            throw new Error(token_response);
        }

        const access_token = token_data.access_token;

        const user_response = await fetch('https://openapi.naver.com/v1/nid/me',{
            headers : {
                Authorization: `Bearer ${access_token}`,
            }
        });

        const user_data = await user_response.json();

        if(user_data.message != 'success' ){
            throw new Error(user_data);
        }

        return user_data.response;

    }catch(err){

        console.error(" ( request_token_social_naver ) Naver Connect Fail : \n", err);
        
        return null;
    }
};