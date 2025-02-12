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
                req.session.login = {
                    input_ID : username
                } ;

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

    // text/html 요청 여부
    if(user_category) {
        // 요청 데이터 확인
        if (user_category === 'post'){
            //유저 작성 게시물
            user_DB.get_userinfo_post( user_id, limit, offset, ( status, service_results ) => {
                if(status){
                    return res.status(500).json({
                        message : "서버에서 요청을 처리하지 못했습니다.",
                        result : false
                    });
                }
                res.json({
                    post_list : service_results,
                    result : true
                });
            });

        } else if (user_category === 'activity'){

            //유저 활동 데이터 반환
            user_DB.get_userinfo_activity(user_id, limit, offset,(status, service_results) => {
                if(status){
                    return res.status(status).json({
                        message : "서버에서 요청을 처리하지 못했습니다.",
                        result : false
                    });
                }

                res.json({
                    activity_list : service_results,
                    result : true
                });
            });

        }else{
            // 유효하지 않음
            return res.status(400).json({
                message : "잘못된 요청입니다.",
                result : false
            });
        }
    } else {
        // GET 렌더링, USER 정보
        user_DB.get_userinfo(user_id, (status, result) => {
            if(status){
                return res.status(status).render('forum_error.ejs', {layout: false , returnStatus : status});
            }

            res.render('forum_user.ejs' , { user_info : result });
        });
    }
};


// 회원 정보 DOM 데이터 GET
exports.api_getSettinginfo = (req,res) => {

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    user_DB.get_Setting_user_info( req.session.user.user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettinginfo => get_Setting_user_info ) : \n", err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }
        if (!service_result.length){
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false
            });
        }

        res.json({
            setting_username : service_result[0].username,
            setting_email : service_result[0].email,
            result : true
        });
    });    
};


// 계정 관리 DOM 데이터 GET
exports.api_getSettingConfig = (req,res) => {

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    user_DB.get_Setting_Social( req.session.user.user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettingConfig => get_Setting_Social ) : \n",err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }
        if (!service_result.length){
            console.error(err);
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false
            });
        }

        res.json({
            social_info : service_result[0],
            result : true
        });
    });    
};



// 닉네임 변경 컨트롤
exports.api_putSettingNickname = (req, res) => {
    const input_nickname = req.body.nickname_input || undefined;

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    if(input_nickname === req.session.user.nickname){
        return res.status(400).json({
            message : "현재와 동일한 닉네임",
            result : false
        });
    }

    if(!input_nickname){
        return res.status(400).json({
            message : "요청한 값이 존재하지 않음",
            result : false
        });
    }

    user_DB.get_Nickname( input_nickname, (err, check) => {
        if(err){
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        if(check.length){
            return res.status(409).json({
                message : "이미 사용중인 닉네임입니다.",
                result : false
            });
        }

        user_DB.put_Setting_Nickname(req.session.user.user_id, input_nickname , (err) => {
            if(err){
                return res.status(500).json({
                    message : "서버에서 요청을 처리하지 못했습니다.",
                    result : false
                });
            }
            
            req.session.user.nickname = input_nickname;
    
            res.json({
                message : '닉네임이 변경되었습니다.',
                result : true
            });
        });
    });
};

// 소셜 해제 컨트롤
exports.api_putSettingSocial = (req, res ) => {
    const social_list = ['github', 'naver'];
    let request_social_name = req.body.social_name;


    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    if(social_list.some(row => row === request_social_name)){
        request_social_name = "key_" + request_social_name;
        user_DB.put_Social_Unconnect(req.session.user.user_id, request_social_name, ( err )=> {
            if(err){
                return res.status(500).json({
                    message : "요청을 처리하는 도중, 문제가 발생했습니다.",
                    result : false
                });
            }

            res.json({
                message : "성공적으로 소셜 연동을 해제하였습니다.",
                result : true
            });
        });
    }else{
        res.status(400).json({
            message : "잘못된 접근으로, 문제가 발생했습니다.",
            result : false
        });
    }
};

// 비밀번호 변경 컨트롤
exports.api_putSettingPassword = ( req, res ) => {
    const current_password = req.body.Current_Password;
    const new_password = req.body.New_Password;
    

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    if(process.env.SEESION_SECURE){
        return res.json({
            message : "( 테스트 ) 비밀번호 변경이 완료되었습니다.",
            result : false
        });
    }
    
    user_DB.put_Password_change(req.session.user.user_id, current_password, new_password, (status,service_message) => {

        if(status){
            return res.status(status).json({
                message : service_message,
                result : false
            });
        }

        res.json({
            message : service_message,
            result : true
        });
    });
};