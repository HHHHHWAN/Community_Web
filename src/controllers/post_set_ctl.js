// forum_list_set.js


const post_set_service = require('../service/post_set_service');




// '/edit'  POST
exports.setCreateContent = (req,res) => {

    // const pagetype = req.params.pagetype;
    const content_id = req.params.content_id;
    const title = req.body.title;
    const text_input = req.body.text_input; 
    const category = req.body.selected_category;

    if ( content_id ){
        // MODIFY
        post_set_service.put_content(title, text_input, content_id, category, (err) => {

            if (err) {
                console.error("( setCreateContent ) => ( put_content ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
            
            res.redirect(`/${category}/${content_id}`);
        });
    } else {
        // NEW EDIT
        post_set_service.add_content(title, text_input, category, req.session.user.user_id, (err,result) => {
            if(err){
                console.error("( setCreateContent ) => ( add_content ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }   

            const newContentId = result.insertId;

            res.redirect(`/${category}/${newContentId}`);
        });
    }
};

// reply ctl
exports.setCreateComment = (req,res) => {
    const content_id = parseInt(req.params.contents_id);
    const comment_id = parseInt(req.params.comment_id) || null;
    const comment_text = req.body.tag_text || '' + req.body.comment_text ;
    

    if(content_id){
        //comment create 
        post_set_service.add_comment(comment_text, req.session.user.user_id, content_id, comment_id, (err) => {
            if (err){
                console.error("( setCreateComment ) => ( add_comment ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
    
            return res.redirect('back');            
        });
    } else {
        // comment modify
        post_set_service.put_comment(comment_text, comment_id, req.session.user.user_id, (err, result) => {
            if (err){
                console.error("( setCreateComment ) => ( put_comment ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            } else if (!result.changedRows){
                console.error("( setCreateComment ) => ( put_comment ) : ", "권한없음");

                return res.status(401).render('forum_error.ejs', { layout : false, returnStatus : 401 });
            }

            res.redirect('back');            
        });
    }
};


// DELETE Method -> invisibly setting
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

