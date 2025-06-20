const manage_set_service = require('../service/manage_set_service');


exports.addReport = (req, res ) => {
    const target_type = req.body.type;
    const target_id = req.body.id;
    const reason = req.body.reason;
    const detail = req.body.detail;
    const request_user = req.session.user.user_id;

    manage_set_service.user_Report( target_type, target_id, request_user, reason, detail, 
        (status, service_result) => {
            if(status){
                return res.status(status).json({
                    message : service_result,
                    result : false
                });
            }

            res.json({
                message : service_result,
                result : true
            });
    });
}


exports.putPostCategory = (req, res) => {
    const content_id = req.body.post_id;
    const category = req.body.category;
    const request_user = req.session.user.user_id;

    manage_set_service.change_posts_category( category, content_id, request_user, ( status, success ) => {

        if(status){
            return res.status(status).json({
                message : " 서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        if(!success){
            return res.status(404).json({
                message : " 요청한 대상을 찾을 수 없습니다. ",
                result : false
            });
        }

        res.json({
            message : `${content_id}번 게시글 ${category.change} 이동 확인`,
            result : true
        });
    });
};

exports.delPost = (req, res) => {
    const target_type = req.body.type;
    const target_id = req.body.id;
    const request_user = req.session.user.user_id;

    manage_set_service.blind_Post( target_type, target_id, request_user, ( status, success ) => {

        if(status){
            return res.status(status).json({
                message : " 서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        if(!success){
            return res.status(404).json({
                message : " 요청한 대상을 찾을 수 없습니다. ",
                result : false
            });
        }

        res.json({
            message : ` 게시글 비공개 처리 확인`,
            result : true
        });
    });
};

exports.restoreIssue = ( req, res ) => {
    const target_type = req.body.type;
    const target_id = req.body.id;
    const request_user = req.session.user.user_id;

    manage_set_service.restore_Issue( target_type, target_id, request_user, ( status, success ) => {

        if(status){
            return res.status(status).json({
                message : " 서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        if(!success){
            return res.status(404).json({
                message : " 요청한 대상을 찾을 수 없습니다. ",
                result : false
            });
        }

        res.json({
            message : `Success`,
            result : true
        });
    });



};