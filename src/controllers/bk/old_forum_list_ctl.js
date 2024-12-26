// controllers/forum_list_ctl 
const Content_db = require('../models/forum_Content');



// 카테고리별 게시물 리스트 출력 컨트롤 
exports.getTypeContents = (req, res) => {
    const { pagetype } = req.params; // url 파라미터 취득
    const page = parseInt(req.query.page) || 1; //?page= url 전송 값 취득  
    const offset = (page - 1) * 10;

    Content_db.get_type(pagetype,offset, (err,results) => {
        if (err) {
            return res.status(500).send('query output error');
        }

        // page 전체 수 확인
        Content_db.get_page_count(pagetype,(err,counts) => {

            const count = Math.ceil(counts.total_count / 10 ); // 소수점 반올림 

            // 데이터를 'contents'라는 이름으로 EJS로 전달 
            res.render('forum_list.ejs' , { Contents : results, pagetype, page, count});
        });
        
    });
};

// 게시물 내용 호출 
exports.getDetailContents = (req, res) => {
    const pagetype = req.params.pagetype; 
    const page = req.query.page; 
    const recall_pagetype = req.query.pagetype; 
    const content_id = req.params.id; 

    Content_db.get_record(content_id, (err,results) => {
        if (err) {
            return res.status(500).send('query output error');
        }

        if (!results) {
            return res.status(404).send("존재하지 않은 게시물 ");
        }
        
        // 페이지 반환 전, 호출한 레코드에서 view_Count 횟수 수정 추가
        Content_db.set_viewcount(content_id, (err) => { // result가 필요없으므로 생략
            if (err){
                return res.status(500).send('query add error : getDetailContents , view_count 수정 에러 ');
            }

            Content_db.get_comment(content_id, (comment_result) => {
                // 데이터를 'contents'라는 이름으로 EJS로 전달 
                res.render('forum_detail.ejs' , { Contents : results, pagetype , Contents_2 : comment_result, page , recall_pagetype });
            });
        });
    });
};

exports.getDetailPost = ( req, res ) => {


    res.json({ 
        Message : "ss" , 
        Content_object : 
    });
};





// popular용 게시물 컨트롤러 
exports.getPopularContents = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const offset = ( page - 1 ) * 10 ;
    // popular contents 10 set load
    Content_db.get_popular_contents(10,offset, (err,results,counts) => { //pagetype 인수 생략 
        if (err) {
            return res.status(500).send('query output error');
        }

        const count = Math.ceil(counts.popular_count / 10 );
        
        // 데이터를 'contents'라는 이름으로 EJS로 전달 
        res.render('forum_list.ejs' , { Contents : results , pagetype : "popular" , page , count }); // ejs 페이지 title 용으로 전송
    });
};











