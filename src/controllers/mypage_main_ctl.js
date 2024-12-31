//forum_main_page
const Content_db = require('../service/forum_Content');


// main page contents load
exports.getMyPagelist = (req, res) => {
    Content_db.get_mainpage_contents((err, result ) => {
        if(err){
            return res.status(500).send('mainpage read error');
        }

        // popular contents load
        Content_db.get_popular_contents(5,0,'',(err, result_popular) => {
            if(err){
                return res.status(500).send('mainpage_popular query READ error');
            }
            

            //default layout off
            res.render('forum_main.ejs' , { Contents : result , Popular : result_popular });
        });

    });
};

