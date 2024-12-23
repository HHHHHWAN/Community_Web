// controllers/User_ctl.js
const redis_client = require('../models/redis_connect');


// service 단 연결
const user_DB = require("../service/User_Service");

// env 연동
require('dotenv').config();

//login get
exports.getLogin_page = ( req , res ) => {
    const returnUrl = req.query.returnUrl || ''; 
    const username = req.query.username || ''; //입력아이디 기억
    const error = req.query.error || ''; 
    const request = req.query.request || ''; 
    const signup  = req.query.signup || ''; 
    const social_signup  = req.query.social_signup || ''; 

    res.render('log_in.ejs', { layout : false , username, error, returnUrl, request, signup, social_signup});
};


//login post
exports.setLogin_page = async ( req , res ) => {
    const { username, password} = req.body;
    const request = req.body.request || '';

    if( username && password){
        user_DB.set_loginUser( req, (status, issue) => {
            if(status){
                // 아이디 없음
                return res.redirect(`/login?error=${issue}&username=${username}&request=${request}`);
            }
            res.redirect(`/`);
        }, username, password , request);

    }else{
        res.redirect('back');
    }
};


// 회원가입 페이지
exports.getSignUp_page = ( req , res ) => {
    const returnUrl  = req.query.returnUrl || ''; 
    const issue  = req.query.issue || ''; 
    const request = req.query.request || '';
    const history = req.session.sign || {};
    delete req.session.sign;
    
    if( request && req.session.social){
        history.social_email = req.session.social.email;
    }

    res.render('sign_up.ejs', { layout : false , issue, request, history});
};

// 회원가입 post
exports.setSignUp_page = async ( req , res ) => {

    req.session.sign = {
        username : req.body.username,
        email : req.body.email,
        nickname : req.body.nickname,
    };

    const request = req.body.request || '';
    const signup_password = req.body.password;


    user_DB.set_createUser(req, signup_password, request, (status, issue) => {

        if(status){
            return res.redirect(`/signup?returnUrl=%2&issue=${issue}&request=${request}`);
        }


        res.redirect(`/login?${issue}`)
    });

};

// 사용자 소셜 계정 연동 승인
exports.getSocialLogin = (req, res) => {
    const social_type = req.params.social_url;
    user_DB.request_auth_social(social_type, (request_url)=> {

        return res.redirect(request_url);
    });
};

// 소셜 연동 승인 콜백
exports.setSocialLogin = async (req, res) => {
    user_DB.request_token_social(req, (status, issue ) => {
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
        // 로그인 완료
        res.redirect(`/`);
    });
};

// 로그아웃 처리
exports.getLogout = (req , res) => {
    if(!req.session.user){
        res.redirect('/login');
    }
    
    const user_id = req.session.user.user_id || '';
    req.session.destroy( err => {
        if (err) {
            console.log("logout_error");
        }

        redis_client.del(`user:${user_id}:session`);
        res.redirect('/login');
    });
};


// 유저 정보 get
exports.getUserinfo = (req, res) => {
    const user_id = req.params.user_id;
    const user_category = req.params.user_category || undefined;

    if(user_category) {
        if (user_category === "post"){
            //유저 작성 게시물
            user_DB.get_userinfo_post(user_id,(results) => {
                return res.json({
                    post_list : results
                });
            });
        } else{
            //유저 활동
            user_DB.get_userinfo_activity(user_id,(results) => {
                return res.json({
                    activity_list : results
                });
            });
        }
    } else {
        // 유저 id, nickname 반환
        user_DB.get_userinfo(user_id, (result) => {
            if(!result){
                return res.status(404).render('forum_error.ejs',{layout:false});
            }

            
            res.render('forum_user.ejs' , { user_info : result});
        });
    }
};