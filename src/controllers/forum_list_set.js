// forum_list_set.js


const Content_Service = require('../service/forum_Content');




// '/:pagetype/edit'  POST
exports.setCreateContent = (req,res) => {
    // const pagetype = req.params.pagetype;
    const content_id = req.params.content_id;
    const title = req.body.title;
    const text_input = req.body.text_input; 
    const category = req.body.selected_category;

    if (content_id){
        // MODIFY
        Content_Service.re_create_content(title, text_input, content_id, category, (err) => {

            if (err) {
                console.error("( setCreateContent ) => ( re_create_content ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
            
            res.redirect(`/${category}/${content_id}`);
        });
    } else {
        // NEW EDIT
        Content_Service.create_content(title, text_input, category, req.session.user.user_id, (err,result) => {
            if(err){
                console.error("( setCreateContent ) => ( create_content ) : ", err);

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
        Content_Service.create_comment(comment_text, req.session.user.user_id, content_id, comment_id, (err) => {
            if (err){
                console.error("( setCreateComment ) => ( create_comment ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
    
            return res.redirect('back');            
        });
    } else {
        // comment modify
        Content_Service.re_create_comment(comment_text, comment_id, req.session.user.user_id, (err, result) => {
            if (err){
                console.error("( setCreateComment ) => ( re_create_comment ) : ", err);

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            } else if (!result.changedRows){
                console.error("( setCreateComment ) => ( re_create_comment ) : ", "권한없음");

                return res.status(401).render('forum_error.ejs', { layout : false, returnStatus : 401 });
            }

            res.redirect('back');            
        });
    }
};


// DELETE Method -> invisibly setting
// '/delete/:content_id'
// '/reply/delete/:comment_id' 
exports.setInvisiblyctl = (req, res) => {
    const content_id = req.params.content_id;
    const comment_id = req.params.comment_id;
    if(content_id){
        Content_Service.set_invisibly_content(content_id, req.session.user.user_id , (err, result) => {
            if(err){
                return res.status(500).json({message : "삭제 처리를 하는 도중 에러가 발생했습니다."});
            }
    
            // 제 3자가 삭제요청을 할 경우
            if(result.changedRows < 1){
                return res.status(401).json({message : "삭제 권한이 없습니다."});
            }
            
            return res.status(200).json({message : "삭제가 완료되었습니다."});
        });
    }else{
        Content_Service.set_invisibly_comment(comment_id, req.session.user.user_id,(err,result) => {
            if(err){
                return res.status(500).json({message : "삭제 처리를 하는 도중 에러가 발생했습니다."});
            }
    
            // 제 3자가 삭제요청을 할 경우
            if(result.changedRows < 1){
                return res.status(401).json({message : "삭제 권한이 없습니다."});
            }
            
            res.status(200).json({message : "삭제가 완료되었습니다."});
        });

    }
};