// src/controllers/forum_list_get.ctl 
const post_get_service = require('../service/post_get_service');


//DB 게시물 리스트 가져오기 ( 10 개 고정 )
function get_Contents(pagetype, page, callback, order_type = "newest_order") {
    const offset = (page - 1) * 10;

    if (pagetype === "popular"){
        post_get_service.get_popular_contents(10, offset, order_type, (status, results, count) => { //pagetype 인수 생략 
            if (status) {
                return callback( status, null, null );
            } 
            
            callback(null, results, count);
        });  
    }else {
        post_get_service.get_type(pagetype, offset, order_type, (status, results) => {
            if (status) {
                return callback( status, results, null );
            }
            // page 수 확인
            post_get_service.get_page_count(pagetype,(status, count) => {
                if (status) {
                    return callback( status, results, count);
                }
                callback(null, results, count);
            });
        });
    }   
};

/// 컨트롤 -> 서비스

// GET 게시글 리스트 ( /api/:pagetype )
exports.api_getContents = (req, res) => {
    const pagetype = req.params.pagetype; // url 파라미터 취득
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  

    get_Contents(pagetype, page, (status, results, count ) => {
        if (status) {
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다." ,
                result : false,
                data : null
            });
        }

        res.json({
            message : "처리 성공",
            result : true,
            data : {
                contents_list : results,
                total_page : count
            }
        });
    });
};

//  GET 게시글 리스트 페이지 ( /:pagetype )
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


// GET 게시글 페이지 ( '/:pagetype/:content_id')
exports.getDetailContents = (req, res) => {
    const content_id = req.params.content_id; 
    const pagetype = req.params.pagetype; 
    
    const returnURL = {
        pagetype : req.query.pagetype || pagetype,
        page : req.query.page || 1
    };
    
    // 유저 조회 기록
    const view_history = req.session.view_history || [];

    post_get_service.get_post_detail(content_id, view_history, (status, post_info, view_history_return) => {
        if (status) {
            return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
        }

        req.session.view_history = view_history_return;

        // 게시글 댓글 요청
        post_get_service.get_comment_list(content_id, ( comment_list ) => {
            //  ( Comment_Info === null )  => 렌더링 댓글없음 공백 처리

            res.render('forum_detail.ejs' , { Content : post_info, Comment_Info : comment_list, pagetype , returnURL });
        });
    });
};

//  GET 글쓰기 페이지  ( /post/edit/:content_id? )
exports.getCreateContent = (req, res) => {
    const pagetype = req.query.pagetype;
    const content_id = req.params.content_id || null;

    // MODIFY?
    if ( content_id ){
        // MODIFY
        post_get_service.get_post_edit(content_id, req.session.user.user_id, (status, post_data) =>{
            if(status){
                return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
            }
    
            res.render('forum_upload.ejs', { pagetype, content_id , post_info : post_data });
        });
    } else {
        // ADD POST
        res.render('forum_upload.ejs', { pagetype , content_id , post_info : null });
    }
};

// GET 검색 페이지 ( /search )
exports.get_SearchContents = (req, res) => {
    const search_keyword = req.query.search_keyword;
    const top_page = parseInt(req.query.pageF) || 1;
    const bottom_page = parseInt(req.query.pageB) || 1;

    post_get_service.get_search_post( search_keyword, top_page, bottom_page, ( status, Search_result ) => {
        if(status){
            console.error("( get_SearchContents ) => ( get_search_post ) : ", err );

            return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
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



