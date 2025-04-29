const user_get_service_object = require("../service/user_get_service");

// env 연동
require('dotenv').config();


/// SSR
// GET USER INFO 
exports.getUserinfo = (req, res) => {

    const user_id = req.params.user_id;

    // GET 렌더링, USER 정보
    user_get_service_object.get_userinfo(user_id, (status, result) => {
        if(status){
            return res.status(status).render('forum_error.ejs', {layout: false , returnStatus : status});
        }

        res.render('forum_user.ejs' , { user_info : result });
    });
};

/// API ----------------------------------------------------------------------------------------------------------------


// 유저 포스팅 정보 요청 ( /user/:user_id/posting )
exports.api_getUserPostingInfo = ( req, res ) => {
    
    const user_id = req.params.user_id; //request user id

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    user_get_service_object.get_userinfo_post( user_id, limit, offset, ( status, service_results ) => {
        if(status){
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            });
        }
        res.json({
            message : "처리 성공",
            result : true,
            data : {
                post_list : service_results
            }
        });
    });
};

// 유저 활동 정보 요청 ( /user/:user_id/activity )
exports.api_getUserActivityInfo = ( req, res ) => {
    
    const user_id = req.params.user_id; //request user id

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = ( page - 1 ) * limit;

    //유저 활동 데이터 반환
    user_get_service_object.get_userinfo_activity(user_id, limit, offset, (status, service_results) => {
        if(status){
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            });
        }

        res.json({
            message : "처리 성공",
            result : true,
            data : {
                activity_list : service_results,
            }
        });
    });
};

// 회원 정보 DOM 데이터 GET
exports.api_getSettinginfo = (req,res) => {

    const request_user_id = req.session.user.user_id;

    user_get_service_object.get_Setting_user_info( request_user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettinginfo => get_Setting_user_info ) : \n", err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            });
        }
        if (!service_result.length){
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false,
                data : null
            });
        }

        res.json({
            message : "처리 성공",
            result : true,
            data : {
                setting_username : service_result[0].username,
                setting_email : service_result[0].email,
                setting_nickname : service_result[0].nickname
            }
        });
    });    
};

// 계정 관리 DOM 데이터 GET
exports.api_getSettingConfig = (req,res) => {

    const request_user_id = req.session.user.user_id;

    user_get_service_object.get_Setting_Social( request_user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettingConfig => get_Setting_Social ) : \n",err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            });
        }
        if (!service_result.length){
            console.error(err);
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false,
                data : null
            });
        }

        res.json({
            message : "처리 성공",
            result : true,
            data : {
                social_info : service_result[0]
            }
        });
    });    
};


// 북마크 리스트 출력
exports.getBookmark_list = ( req, res ) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = ( page - 1 ) * limit;
    const request_user_id = req.session.user.user_id;

    user_get_service_object.get_Bookmark_list( request_user_id, limit, offset, (status, service_result) => {
        if(status){
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "조회 완료",
            result : true,
            data : {
                list : service_result
            }
        });
    });

};

// 북마크 체크
exports.getBookmark = (req, res) => {
    const content_id = parseInt(req.params.content_id);
    const request_user_id = req.session.user.user_id;

    user_get_service_object.get_Bookmark_info( content_id, request_user_id, (status, service_result) => {
        if(status){
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "조회 완료",
            result : true,
            data : {
                check : service_result
            }
        });
    });
};