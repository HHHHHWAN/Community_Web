// src/controllers/forum_list_get.ctl 

//get DB connnect object
const Content_Service = require('../service/forum_Content');


//DB 게시물 리스트 가져오기 ( 10 개 고정 )
function get_Contents(pagetype, page, callback, order_type = "newest_order") {
    const offset = (page - 1) * 10;

    if (pagetype === "popular"){
        Content_Service.get_popular_contents(10, offset, order_type, (err, results, counts) => { //pagetype 인수 생략 
            if (err) {
                return res.status(500).send('query output error');
            } 
            const count = Math.ceil(counts.popular_count / 10 );  

            callback(results,count);
        });  
    }else {
        Content_Service.get_type(pagetype, offset, order_type, (err,results) => {
            if (err) {
                return res.status(500).send('query output error');
            }

            // page 전체 수 확인
            Content_Service.get_page_count(pagetype,(err,count) => {

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

//  forum_list in forum navi 
exports.getTypeContents = (req, res) => {
    const pagetype = req.params.pagetype || "popular"; // url 파라미터 취득
    const order_type = req.query.order || "newest_order";
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  
    
    get_Contents(pagetype, page, (results, count) => {
        res.render('forum_list.ejs' , { Contents : results, pagetype, page, count, order_type });
    }, order_type);
};




// Detail View 정적 페이지 반환
exports.getDetailContents = (req, res) => {
    const pagetype = req.params.pagetype; 
    const returnURL = {
        pagetype : req.query.pagetype || pagetype,
        page : req.query.page || 1
    };
    const content_id = req.params.id; 

    Content_Service.get_record(content_id, "view", (err,results) => {
        if (err) { // 서버 에러
            return res.status(500).send('query output error');
        }

        if (!results) { // 클라이언트 잘못된 요청, 존재하지 않은 게시글
            return res.status(404).render('forum_error.ejs',{layout:false});
        }

        //get Content Comments
        Content_Service.get_comment_list(content_id, (Comment_Info) => {

            res.render('forum_detail.ejs' , { Contents : results, Comment_Info, pagetype , returnURL });
        });
    });
};

exports.getDetailPost = ( req, res) => {
    const content_id = req.params.Content_id;

    Content_Service.get_record(content_id, "view", (err,results) => {
        if (err) { // 서버 에러
            console.log(err);
            return res.status(500).json({
                Message : 'query output error',
                Content_object : results
            });
        }

        if (!results) { // 클라이언트 잘못된 요청, 존재하지 않은 게시글
            return res.status(404).json({
                Message : 'invaild Post',
                Content_object : results
            });
        }

        res.status(200).json({ 
            Message : "Post Response OK", 
            Content_object : results
        });
    });
};



//게시물 작성 페이지
exports.getCreateContent = (req, res) => {
    const { pagetype } = req.params;
    const content_id = req.query.contentid || '';

    if (content_id){
        Content_Service.get_record(content_id,"edit",(err, post_info) =>{
           
            if(err){
                res.status(500).send("게시물 불러오기 실패");
            } else if ( !post_info || (post_info.user_id != req.session.user.user_id ) ){
                return res.status(404).render('forum_error.ejs',{ layout : false });
            }
    
            res.render('forum_upload.ejs', { pagetype , content_id , post_info });
        });
    } else {
        res.render('forum_upload.ejs', { pagetype , content_id , post_info : undefined });
    }

};


exports.get_SearchContents = (req, res) => {
    const search_keyword = req.query.search_keyword;
    const front_page = parseInt(req.query.pageF) || 1;
    const back_page = parseInt(req.query.pageB) || 1;

    Content_Service.get_search_post(search_keyword,front_page,back_page, (err, post_contents, post_comments, contents_count, comments_count) => {
        if(err){
            return res.status(500).render('forum_error.ejs',{ layout : false });
        }

        res.render('forum_search', {search_keyword, post_contents, post_comments, front_page, back_page, contents_count, comments_count});
    });
};



