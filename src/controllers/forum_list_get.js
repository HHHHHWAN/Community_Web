// src/controllers/forum_list_get.ctl 

//get DB connnect object
const Content_db = require('../service/forum_Content');


//DB 게시물 리스트 가져오기 ( 10 개 고정 )
function get_Contents(pagetype, page, callback, order_type = "newest_order") {
    const offset = (page - 1) * 10;

    if (pagetype === "popular"){
        Content_db.get_popular_contents(10, offset, order_type, (err, results, counts) => { //pagetype 인수 생략 
            if (err) {
                return res.status(500).send('query output error');
            } 
            const count = Math.ceil(counts.popular_count / 10 );  

            callback(results,count);
        });  
    }else {
        Content_db.get_type(pagetype, offset, order_type, (err,results) => {
            if (err) {
                return res.status(500).send('query output error');
            }

            // page 전체 수 확인
            Content_db.get_page_count(pagetype,(err,count) => {

                callback(results,count);
            });
        });
    }   
};

// forum list in detail_view
exports.api_getContents = (req, res) => {
    const pagetype = req.params.pagetype; // url 파라미터 취득
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  

    get_Contents(pagetype, page, (results, count ) => {
        res.json({
            contents: results,
            page: page,
            totalPages: count
        });
    });
};

function get_Comments( content_id, callback ){
    Content_db.get_comment_list(content_id, (DB_results) => {
        callback(DB_results);
    });
};


//  forum_list in forum navi 
exports.getTypeContents = (req, res) => {
    const pagetype = req.params.pagetype || "popular"; // url 파라미터 취득
    const order_type = req.query.order || "newest_order";
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  
    
    get_Contents(pagetype, page, (results, count) => {
        res.render('forum_list.ejs' , { Contents : results, pagetype, page, count, order_type });
    }, order_type);
};




// 게시물 내용 호출 
exports.getDetailContents = (req, res) => {
    const pagetype = req.params.pagetype; 
    const page = req.query.page || 1; 
    const recall_pagetype = req.query.pagetype || pagetype ; 
    const content_id = req.params.id; 

    Content_db.get_record(content_id, (err,results) => {
        if (err) {
            return res.status(500).send('query output error');
        }

        if (!results) {
            return res.status(404).render('forum_error.ejs',{layout:false});
        }
        
        // 페이지 반환 전, 호출한 레코드에서 view_Count 횟수 수정 추가
        Content_db.set_viewcount(content_id, (err) => { // result가 필요없으므로 생략
            if (err){
                return res.status(500).send('query add error : getDetailContents , view_count 수정 에러 ');
            }
            get_Contents(pagetype, page, (contents_list, contents_count)=>{
                
                get_Comments(content_id , (comments) => {
                    res.render('forum_detail.ejs' , { Contents : results, comments, pagetype , page , recall_pagetype, contents_list, contents_count });
                });
            });
        });
    });
};


//게시물 작성 페이지
exports.getCreateContent = (req, res) => {
    const { pagetype } = req.params;
    const content_id = req.query.contentid || '';

    if (content_id){
        Content_db.get_record(content_id,(err,result) =>{
            //임시
            if(err){
                res.status(500).send("게시물 불러오기 실패");
            } else if ( !result || (result.user_id != req.session.user.user_id ) ){
                return res.status(404).render('forum_error.ejs',{ layout : false });
            }
    
            res.render('forum_upload.ejs', { pagetype , content_id , result });
        });
    } else {
        res.render('forum_upload.ejs', { pagetype , content_id , result : undefined });
    }

};


exports.get_SearchContents = (req, res) => {
    const search_keyword = req.query.search_keyword;
    const front_page = parseInt(req.query.pageF) || 1;
    const back_page = parseInt(req.query.pageB) || 1;

    Content_db.get_search_post(search_keyword,front_page,back_page, (err, post_contents, post_comments, contents_count, comments_count) => {
        if(err){
            return res.status(500).render('forum_error.ejs',{ layout : false });
        }

        res.render('forum_search', {search_keyword, post_contents, post_comments, front_page, back_page, contents_count, comments_count});
    });
};



