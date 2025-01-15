//forum_main_page
const Content_db = require('../service/forum_Content');


// main page contents load
exports.getMyPagelist = (req, res) => {
    Content_db.get_mainpage_contents((err, result ) => {
        if(err){
            console.error("( getMyPagelist ) => ( get_mainpage_contents ) : ", err );

            return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
        }

        // popular contents load
        Content_db.get_popular_contents(5,0,'',(err, result_popular) => {
            if(err){

                console.error("( getMyPagelist ) => ( get_popular_contents ) : ", err );

                return res.status(500).render('forum_error.ejs', { layout : false, returnStatus : 500 });
            }
            

            //default layout off
            res.render('forum_main.ejs' , { Contents : result , Popular : result_popular });
        });

    });
};

