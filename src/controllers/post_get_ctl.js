// src/controllers/forum_list_get.ctl 

const post_get_service = require('../service/post_get_service');


//DB 게시물 리스트 가져오기 ( 10 개 고정 )
function get_Contents(pagetype, page, callback, order_type = "newest_order") {
    const offset = (page - 1) * 10;

    if (pagetype === "popular"){
        post_get_service.get_popular_contents(10, offset, order_type, (err, results, count) => { //pagetype 인수 생략 
            if (err) {
                console.error("( get_Contents ) => ( get_popular_contents ) : ", err);

                return callback( 500, results, null );
            } 
            
            callback(null, results, count);
        });  
    }else {
        post_get_service.get_type(pagetype, offset, order_type, (err,results) => {
            if (err) {
                console.error("( get_Contents ) => ( get_type ) : ", err);

                return callback( 500, results, null );
            }

            // page 전체 수 확인
            post_get_service.get_page_count(pagetype,(err,count) => {
                if (err) {
                    console.error("( get_Contents ) => ( get_page_count ) : ", err);

                    return callback(500, results, count);
                }

                callback(null, results, count);
            });
        });
    }   
};

// forum list in detail_view -> return JSON
exports.api_getContents = (req, res) => {
    const pagetype = req.params.pagetype; // url 파라미터 취득
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  

    get_Contents(pagetype, page, (status, results, count ) => {
        if (status) {
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다." ,
                result : false
            });
        }

        res.json({
            contents: results,
            page: page,
            totalPages: count
        });
    });
};

//  forum_list in forum navi 
exports.getTypeContents = (req, res) => {
    const pagetype = req.params.pagetype || "popular"; // url 파라미터 취득
    const order_type = req.query.order || "newest_order";
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  
    
    get_Contents(pagetype, page, (status, results, count) => {
        if (status) {
            return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
        }
        res.render('forum_list.ejs' , { Contents : results, pagetype, page, count, order_type });
    }, order_type);
};


// GET POST, EJS 
exports.getDetailContents = (req, res) => {
    
    const content_id = req.params.id; 
    const pagetype = req.params.pagetype; 
    
    const returnURL = {
        pagetype : req.query.pagetype || pagetype,
        page : req.query.page || 1
    };
    
    
    const view_history = req.session.view_history || [];

    post_get_service.get_record(content_id, view_history, 'view', (err, post_info, view_history_return) => {
        if (err) {
            console.error("( getDetailContents ) => ( get_record ) MySQL2 : \n", err );
            return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
        }

        if (!post_info) {
            return res.status(400).render('forum_error.ejs', { layout:false, returnStatus : 400 });
        }

        req.session.view_history = view_history_return;

        //get Content Comments
        post_get_service.get_comment_list(content_id, ( comment_list ) => {
            // Comment_Info === null => 렌더링 공백 처리

            res.render('forum_detail.ejs' , { Content : post_info, Comment_Info : comment_list, pagetype , returnURL });
        });
    });
};

//'/:pagetype/edit' ( Session check )
exports.getCreateContent = (req, res) => {
    const pagetype = req.params.pagetype;
    const content_id = req.params.content_id || null;

    if ( content_id ){
        post_get_service.get_record(content_id, null , 'edit', (err, post_data) =>{
           
            if(err){
                console.error("( getCreateContent ) => ( get_record ) MySQL2 : \n", err );

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
            if ( !post_data || (post_data.user_id !== req.session.user.user_id ) ){

                return res.status(403).render('forum_error.ejs', { layout : false, returnStatus : 403  });
            }
    
            res.render('forum_upload.ejs', { pagetype , content_id , post_info : post_data });
        });
    } else {
        res.render('forum_upload.ejs', { pagetype , content_id , post_info : null });
    }
};

exports.get_SearchContents = (req, res) => {
    const search_keyword = req.query.search_keyword;
    const top_page = parseInt(req.query.pageF) || 1;
    const bottom_page = parseInt(req.query.pageB) || 1;

    post_get_service.get_search_post( search_keyword, top_page, bottom_page, ( err, Search_result ) => {
        if(err){
            console.error("( get_SearchContents ) => ( get_search_post ) : ", err );

            return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
        }

        res.render('forum_search', 
            { 
                search_keyword,
                Contents_list : Search_result.Contents_list,
                Comments_list : Search_result.Comments_list,
                Content_total : Search_result.Content_total,
                Comment_total : Search_result.Comment_total,
                top_page,
                bottom_page
            });
    });
};



