const post_get_service = require('../service/post_get_service');


exports.getMyPagelist = (req, res) => {
    post_get_service.get_mainpage_contents(( err, category_result ) => {
        if(err){
            console.error("( getMyPagelist ) => ( get_mainpage_contents ) MySQL2 :\n", err );

            return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
        }

        // popular contents load
        post_get_service.get_popular_contents(5,0,'',( err, popular_result ) => {
            if(err){
                console.error("( getMyPagelist ) => ( get_popular_contents )  MySQL2 :\n", err );

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
            
            //default layout off
            res.render('forum_main.ejs' , { Contents : category_result , Popular : popular_result });
        });

    });
};

