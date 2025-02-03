// controllers/User_ctl.js
const redis_client = require('../models/redis_connect');


// service 단 연결
const user_DB = require("../service/User_Service");

// env 연동
require('dotenv').config();

//'/login' get
exports.getLogin_page = ( req , res ) => {
    const returnUrl = req.query.returnUrl || ''; 
    const history = req.session.login || {}; 
    delete req.session.login;

    const error = req.query.error || ''; 
    const request = req.query.request || ''; 

    const signup  = req.query.signup || ''; 
    const social_signup  = req.query.social_signup || ''; 

    res.render('log_in.ejs', { layout : false , history, error, returnUrl, request, signup, social_signup});
};


//'/login' post
exports.setLogin_page = async ( req , res ) => {
    const username = req.body.username;
    const password = req.body.password;
    const request = req.body.request || '';

    if( username && password){
        user_DB.set_loginUser( req, (status, issue) => {
            if(status){
                // unknown
                req.session.login.input_ID = username;

                return res.redirect(`/login?error=${issue}&request=${request}`);
            }
            res.status(201).redirect(`/`);
        }, username, password , request);

    }else{
        res.status(400).redirect('back');
    }
};


// signup get
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

// signup post
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


// GET USER INFO 
exports.getUserinfo = (req, res) => {
    const user_id = req.params.user_id;
    const user_category = req.params.user_category || undefined;

    const page = parseInt(req.query.page) || 1;
    const limit = page * 10;
    const offset = (page - 1) * 10;

    // SSR REQUEST CHECK ( DEFAULT "EDIT POST")
    if(user_category) {
        // API REQUEST CHECK
        if (user_category === 'post'){
            //유저 작성 게시물
            user_DB.get_userinfo_post( user_id, limit, offset, ( err, results ) => {
                if(err){
                    console.error("( getUserinfo => get_userinfo_post ) : " ,err);
                    return res.status(500).render('forum_error.ejs',{ layout:false, returnStatus : 500 });
                }

                if(!results){
                    return res.status(400).render('forum_error.ejs',{ layout:false, returnStatus : 400  });
                }

                res.json({
                    post_list : results
                });
            });
        } else if (user_category === 'activity'){
            //유저 활동
            user_DB.get_userinfo_activity(user_id, limit, offset,(err, results) => {
                if(err){
                    console.error("( getUserinfo => get_userinfo_activity ) : " ,err);
                    return res.status(500).render('forum_error.ejs',{ layout:false, returnStatus : 500 });
                }
                if(!results){
                    return res.status(400).render('forum_error.ejs',{ layout:false, returnStatus : 400  });
                }

                res.json({
                    activity_list : results
                });
            });
        } else{
            res.status(400).render('forum_error.ejs',{layout:false, returnStatus:400});
        }
    } else {
        // GET EJS, USER POST
        user_DB.get_userinfo(user_id, (err, result) => {
            if(err){
                console.error(err);
                return res.status(500).render('forum_error.ejs',{ layout:false, returnStatus : 500 });
            }

            if(!result){
                return res.status(400).render('forum_error.ejs',{ layout:false, returnStatus : 400  });
            }

            res.render('forum_user.ejs' , { user_info : result});
        });
    }
};