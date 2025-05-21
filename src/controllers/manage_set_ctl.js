const manage_set_service = require('../service/manage_set_service');



exports.putPostCategory = (req, res) => {
    const content_id = req.body.post_id;
    const category = req.body.move_category;
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
            message : `${content_id}번 게시글 ${category} 이동 확인`,
            result : true
        });
    });
};


exports.delPost = (req, res) => {
    const content_id = req.body.post_id;
    const request_user = req.session.user.user_id;

    manage_set_service.block_posts( content_id, request_user, ( status, success ) => {

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


exports.delComment = (req, res) => {
    const comment_id = req.body.comment_id;
    const request_user = req.session.user.user_id;

    manage_set_service.block_comments( comment_id, request_user, ( status, success ) => {

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
            message : ` 댓글 비공개 처리 확인`,
            result : true
        });
    });
};