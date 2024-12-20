// User_Service Sub Oauth Service Module


exports.request_token_social_github = async (request_code) => {
    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

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
                client_id: client_id,
                client_secret : client_secret,
                code : request_code,
                redirect_uri : 'http://localhost:2200/login/github/callback',
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

exports.request_token_social_naver= (request_code) => {
    const client_id = process.env.NAVER_CLIENT_ID;
    const client_secret = process.env.NAVER_CLIENT_SECRET;

};