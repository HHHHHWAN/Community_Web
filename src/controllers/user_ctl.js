const user_DB = require("../service/User_Service");

// env 연동
require('dotenv').config();


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

