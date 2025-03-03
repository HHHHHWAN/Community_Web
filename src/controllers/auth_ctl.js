const redis_client = require('../models/redis_connect');

// const user_DB = require("../service/User_Service");

const auth_service_object = require("../service/auth_service");


// 회원가입 렌더링
exports.getSignUp_page = ( req , res ) => {
    req.session.returnURL = req.query.returnUrl || '/'; 
    const issue  = req.query.issue || ''; 
    const request = req.query.request || '';
    const history = req.session.sign || {};
    delete req.session.sign;
    
    if( request && req.session.social){
        history.social_email = req.session.social.email;
    }

    res.render('sign_up.ejs', { layout : false , issue, request, history});
};



// 로그인 렌더링
exports.getLogin_page = ( req , res ) => {
    req.session.returnURL = req.query.returnUrl || '/'; 
    const history = req.session.login || {}; 
    delete req.session.login;

    const error = req.query.error || ''; 
    const request = req.query.request || ''; 

    const signup  = req.query.signup || ''; 
    const social_signup  = req.query.social_signup || ''; 

    res.render('log_in.ejs', { layout : false , history, error, request, signup, social_signup});
};



// 사용자 소셜 계정 연동 승인
exports.getSocialLogin = (req, res) => {
    const social_type = req.params.social_url;
    auth_service_object.request_auth_social(social_type, (request_url)=> {

        return res.redirect(request_url);
    });
};


// 소셜 연동 승인 콜백
exports.setSocialLogin = async (req, res) => {
    auth_service_object.request_token_social(req, (status, issue ) => {
        // status === 'null' : ok
        if(status){
            switch (issue){
                case 'auth_signup_request' :
                    return res.redirect(`/signup?request=${issue}`);
                case 'auth_login_request' :
                    return res.redirect(`/login?request=${issue}`);
                default :
                    // server error result page
                    return res.redirect(`/login?error=${issue}`);
            }
        }

        const return_url = req.session.returnURL;
        delete req.session.returnURL;
        // 로그인 완료
        res.redirect(`${return_url}`);
    });
};


//'/login' post
exports.setLogin_page = async ( req , res ) => {
    const username = req.body.username;
    const password = req.body.password;
    const request = req.body.request || '';

    if( username && password){
        auth_service_object.set_loginUser( req, (status, issue) => {
            if(status){
                // unknown
                req.session.login = {
                    input_ID : username
                } ;

                return res.redirect(`/login?error=${issue}&request=${request}`);
            }

            const return_url = req.session.returnURL;
            delete req.session.returnURL;

            res.redirect(`${return_url}`);
        }, username, password , request);

    }else{
        res.status(400).redirect('back');
    }
};


// signup post
exports.setSignUp_page = async ( req , res ) => {

    req.session.sign = {
        username : req.body.username,
        email : req.body.email,
        nickname : req.body.nickname,
    };

    const request = req.body.request || '';
    const signup_password = req.body.password;


    auth_service_object.set_createUser(req, signup_password, request, (status, issue) => {

        if(status){
            return res.redirect(`/signup?returnUrl=%2&issue=${issue}&request=${request}`);
        }


        res.redirect(`/login?${issue}`)
    });

};



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