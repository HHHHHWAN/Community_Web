// forum_list_set.js

const post_set_service = require('../service/post_set_service');
const Upload = require('../middleware/upload_multer');



// POST 글 작성  ( /post/edit )
exports.setAddContent = ( req, res ) => {
    
    const title = req.body.title;
    const text_input = req.body.text; 
    const category = req.body.category;

    post_set_service.add_content(title, text_input, category, req.session.user.user_id, (status, post_id) => {
        if(status){
            return res.status(status).json({
                message : "게시물 작성을 실패했습니다.",
                post_id,
                result : false
            });
        }   

        res.json({
            message : "게시물 작성을 성공했습니다.",
            post_id,
            result : true
        });
    });
};

// POST 글 수정 요청 ( /post/update )
exports.putUpdateContent = ( req, res ) => {

    const title = req.body.title;
    const text_input = req.body.text; 
    const category = req.body.category;
    const content_id = req.body.post_id;
    
    post_set_service.put_content(title, text_input, content_id, category, req.session.user.user_id, ( status, message ) => {

        if (status) {
            return res.status(status).json({
                message,
                post_id : content_id,
                result : false
            });
        }

        res.json({
            message,
            post_id : content_id,
            result : true
        });
    });
};

// POST 댓글 작성 요청 ( /reply/edit )
exports.setAddComment= ( req, res ) => {
    
    const comment_text = req.body.text; 
    const parent_id = req.body.parent_id;
    const content_id = req.body.content_id;

    post_set_service.add_comment(comment_text, req.session.user.user_id, content_id, parent_id, (status) => {
        if(status){
            return res.status(status).json({
                message : "댓글 작성을 실패했습니다.",
                result : false
            });
        }   

        res.json({
            message : "댓글 작성을 성공했습니다.",
            result : true
        });
    });
};

// put 댓글 수정 요청 ( /reply/update )
exports.putUpdateComment = ( req, res ) => {

    const comment_text = req.body.text;
    const comment_id = req.body.comment_id;
    
    post_set_service.put_comment(comment_text, comment_id, req.session.user.user_id, ( status, message ) => {
        if (status) {
            return res.status(status).json({
                message,
                result : false
            });
        }

        res.json({
            message,
            result : true
        });
    });
};

// delete 게시글 삭제 요청 ( /post/delete )
exports.deleteContent = (req, res) => {

    const content_id = req.body.post_id;

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되어, 해당 요청을 승인할 수 없습니다.",
            result : false
        });
    }

    post_set_service.set_invisibly_content(content_id, req.session.user.user_id , (err, result) => {
        if(err){
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        // 제 3자가 삭제요청을 할 경우
        if(result.changedRows < 1){
            return res.status(403).json({
                message : "권한이 없습니다.",
                result : false
            });
        }
        
        res.json({
            message : "삭제가 완료되었습니다.",
            result : true
        });
    });
};

// delete 댓글 삭제 요청 ( /reply/delete )
exports.deleteComment = (req, res) => {

    const comment_id = req.body.comment_id;

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되어, 해당 요청을 승인할 수 없습니다.",
            result : false
        });
    }

    post_set_service.set_invisibly_comment(comment_id, req.session.user.user_id,(err,result) => {
        if(err){
            return res.status(500).json({message : "삭제 처리를 하는 도중 에러가 발생했습니다."});
        }

        // 제 3자가 삭제요청을 할 경우
        if(result.changedRows < 1){
            return res.status(403).json({
                message : "권한이 없습니다.",
                result : false
            });
        }
        
        res.json({
            message : "삭제가 완료되었습니다.",
            result : true
        });
    });

};

// Image upload 
exports.uploadImage = (req, res) => {
        // upload
        Upload.single('image')( req, res, (err) => {
            //upload result 
            if(err){
                if( err.code === 'LIMIT_FILE_SIZE'){
                    err.message = '5MB를 초과하는 파일입니다.';
                }
                
                return res.status(400).json({ 
                    message: err.message,
                    filePath : null,
                    result : false
                }); 
            }

            post_set_service.set_file_list(req, (status, service_result) => {
                if(status){
                    return res.status(status).json({ 
                        message: '서버에서 요청을 처리하지 못했습니다.',
                        filePath : service_result,
                        result : false
                    }); 
                }

                res.json({ 
                    message: 'Success' ,
                    filePath : service_result,
                    result : true
                }); 
            });
        });
};
