const redis_client = require('../models/redis_connect');

// const user_DB = require("../service/User_Service");

const auth_service_object = require("../service/auth_service");



/// SSR --------------------------------------------------

// 회원가입 렌더링
exports.getSignUp_page = ( req , res ) => {
    // req.session.returnURL = req.query.returnUrl || '/';  // 진입 경로 
    const issue  = req.query.issue || ''; // 문제 체크용 
    const request = req.query.request || ''; // OLD 이전 회원가입을 유도한 것인지 체크 용
    const history = req.session.sign || {};
    delete req.session.sign;
    
    // 소셜 연동 체크
    if( req.session.social ){
        history.social_email = req.session.social.email;
    }

    res.render('sign_up.ejs', { layout : false , issue, request, history});
};



// 로그인 렌더링
exports.getLogin_page = ( req , res ) => {
    req.session.returnURL = req.query.returnUrl || '/'; 

    const error = req.query.error || ''; 
    const request = req.query.request || ''; 

    const signup  = req.query.signup || ''; 
    const social_signup  = req.query.social_signup || ''; 

    res.render('log_in.ejs', { layout : false , error, request, signup, social_signup});
};


/// 리다이렉트 --------------------------------------------------

// 소셜 인증 이동
exports.getSocialLogin = (req, res) => {
    const social_type = req.params.social_url;
    auth_service_object.get_social_oauth(social_type, (request_url)=> {
        return res.redirect(request_url);
    });
};



// 소셜 로그인 ( /login/:social_url/callback )
exports.setSocialLogin = async (req, res) => {
    let returnURL = req.session.returnURL;
    delete req.session.returnURL;

    auth_service_object.set_social_login(req, (status, redirect_url ) => {
    
        // 연동 실패
        if(status){
            return res.status(status).render('forum_error.ejs', { layout: false, returnStatus : status });   
        }

        if(redirect_url === '/signup'){
            returnURL = redirect_url;
        }

        
        res.redirect(returnURL);
    });
};


// 로그인 요청 ( /login ) 
exports.setLogin = ( req, res ) => {
    const returnURL = req.session.returnURL;
    delete req.session.returnURL;

    const input_username = req.body.username;
    const input_password = req.body.password;

    // 공백여부 체크
    if( !input_username && !input_password ){
        return res.status(400).json({
            message : "잘못된 접근 방식입니다.",
            result : false,
            data : null
        });
    }
    
    auth_service_object.set_login( req, input_username, input_password, (status, service_message) => {
        if(status){
            return res.status(status).json({
                message : service_message,
                result : false,
                data : null
            });
        }

        res.json({
            message : "로그인 처리 완료",
            result : true,
            data : { returnURL }
        });
    });
};

/// test --------------------------------

// signup post old
exports.setSignUp_page = async ( req , res ) => {

    req.session.sign = {
        username : req.body.username,
        email : req.body.email,
        nickname : req.body.nickname,
    };

    const request = req.body.request || ''; // 일반 회원가입 , 소셜 연동인지 체크
    const signup_password = req.body.password;


    auth_service_object.set_createUser(req, signup_password, request, (status, issue) => {

        if(status){
            return res.redirect(`/signup?returnUrl=%2&issue=${issue}&request=${request}`);
        }


        res.redirect(`/login?${issue}`)
    });

};


// signup post new 
exports.setSignUp = async ( req , res ) => {

    req.session.sign = {
        username : req.body.username,
        email : req.body.email,
        nickname : req.body.nickname,
    };
    const sign_password = req.body.password; 

    // const request = req.body.request || ''; // 일반 회원가입 , 소셜 연동인지 체크

    auth_service_object.set_signup(req, sign_password, (status, service_message, service_result) => {

        if(status){
            return res.status(status).json({
                message : service_message,
                result : false,
                data : {
                    service_result
                }
            })
        }


        res.json({
            message : "회원가입이 완료되었습니다.",
            result : true,
            data : null
        });
    });

};

/// test --------------------------------



// 로그아웃 처리
exports.getLogout = (req , res) => {
    const user_id = req.session.user.user_id || '';
    req.session.destroy( err => {
        if (err) {
            console.error(" ( getLogout ) : ", err);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        redis_client.del(`user:${user_id}:session`);

        res.json({
            message : "로그아웃 처리 되었습니다.",
            result : true
        });
    });
};

