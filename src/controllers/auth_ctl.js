const redis_client = require('../models/redis_connect');

// const user_DB = require("../service/User_Service");

const auth_service_object = require("../service/auth_service");



/// SSR --------------------------------------------------

/** 회원가입 페이지 렌더링 */ 
exports.getSignUp_page = ( req , res ) => {

    // 소셜 연동 체크
    const social_request = req.session.social ? true : false;

    res.render('sign_up.ejs', { layout : false , social_request});
};



/** 로그인 페이지 렌더링 */ 
exports.getLogin_page = ( req , res ) => {
    req.session.returnURL = req.query.returnUrl || '/'; 
    delete req.session.social;

    res.render('log_in.ejs', { layout : false});
};


/// 리다이렉트 --------------------------------------------------

/** 소셜 인증 이동 () */ 
exports.getSocialLogin = (req, res) => {
    const social_type = req.params.social_url;
    auth_service_object.get_social_oauth(social_type, (request_url)=> {
        return res.redirect(request_url);
    });
};



/** 소셜 로그인 ( /login/:social_url/callback ) */ 
exports.setSocialLogin = async (req, res) => {
    let returnURL = req.session.returnURL || '/';
    delete req.session.returnURL;

    auth_service_object.set_social_login(req, (status, request_info , service_message) => {
    
        // 연동 실패
        if(status){
            if( request_info === 'register' ){
                return res.send(`
                    <script>
                        alert("${service_message || "서버에서 요청을 처리하지 못했습니다." }");
                        window.location.href = "/user/settings?nav=config";
                    </script>
                `);
            }

            return res.status(status).render('forum_error.ejs', { layout: false, returnStatus : status });   
        }


        if(request_info === 'signup'){
            returnURL = `/signup`;
        }

        if( request_info === 'register'){
            returnURL = `/user/settings?nav=config` ;
        }

        res.redirect(returnURL);
    });
};


/** 로그인 요청 ( /login ) */  
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


/** 회원가입 요청 ( /signup ) */
exports.setSignUp = async ( req , res ) => {

    auth_service_object.set_signup(req, (status, service_message, service_result) => {

        if(status){
            return res.status(status).json({
                message : service_message,
                result : false,
                data : {
                    service_result
                }
            });
        }

        res.json({
            message : "회원가입이 완료되었습니다.",
            result : true,
            data : null
        });
    });

};


/** 로그아웃 요청 */
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

