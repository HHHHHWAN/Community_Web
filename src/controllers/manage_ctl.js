const manage_service = require('../service/manage_service');



exports.putPostCategory = (req, res) => {
    const content_id = req.body.post_id;
    const category = req.body.move_category;

    manage_service.change_posts_category( category, content_id, ( status, success ) => {

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
            message : `${content_id} ${category} 확인`,
            result : true
        });
    });
};


exports.delPost = (req, res) => {
    res.json({
        message : "확인",
        result : true
    });
};


exports.delComment = (req, res) => {
    res.json({
        message : "확인",
        result : true
    });
};