const post_get_service = require('../service/post_get_service');


exports.getMyPagelist = (req, res) => {
    // 게시글 리스트 5건 씩 요청
    post_get_service.get_mainpage_contents(( status, category_result ) => {
        if(status){
            return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
        }

        // popular contents load
        post_get_service.get_popular_contents(5,0,'',( status, popular_result ) => {
            if(status){
                return res.status(status).render('forum_error.ejs', { layout : false, returnStatus : status });
            }
            
            res.render('forum_main.ejs' , { Contents : category_result , Popular : popular_result });
        });

    });
};

