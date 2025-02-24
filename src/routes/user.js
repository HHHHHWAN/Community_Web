const express = require('express');
const router = express.Router();
require('dotenv').config();

///controller
// const main_Controller = require('../controllers/mypage_main_ctl'); 
const user_Controller = require('../controllers/user_ctl');
// const get_Controller = require('../controllers/forum_list_get');
// const set_Controller = require('../controllers/forum_list_set');

//middleware
const urlType_Check = require('../middleware/url_content_check');
const user_check = require('../middleware/user_check');



/// GET SSR
router.get('/user/settings', user_check.check_login, (req, res) => {
    res.render('forum_setting.ejs');
});

/// GET SSR && API
router.get('/user/:user_id/:user_category?', user_Controller.getUserinfo);





module.exports = router;