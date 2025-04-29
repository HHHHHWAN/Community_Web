const express = require('express');
const router = express.Router();
require('dotenv').config();

///User Controller
const get_Controller = require('../controllers/user_get_ctl');
const set_Controller = require('../controllers/user_set_ctl');

//middleware
const user_check = require('../middleware/user_check');

/// SSR ---

// USER SETTING
router.get('/user/settings', user_check.check_login, (req, res) => {
    res.render('forum_setting.ejs');
});

// USER INFO
router.get('/user/:user_id', get_Controller.getUserinfo);


/// API ---

// LIKE
router.post('/like/:target_type/:target_id', user_check.check_login, set_Controller.setLike);
router.delete('/like/:target_type/:target_id', user_check.check_login, set_Controller.delLike);

// BOOKMARK
router.get('/user/bookmark/list', user_check.check_login, get_Controller.getBookmark_list);
router.get('/user/bookmark/:content_id', user_check.check_login, get_Controller.getBookmark);
router.post('/user/bookmark/:content_id', user_check.check_login, set_Controller.setBookmark);
router.delete('/user/bookmark/:content_id', user_check.check_login, set_Controller.delBookmark);


// USER INFO
router.get('/user/:user_id/posting', get_Controller.api_getUserPostingInfo);
router.get('/user/:user_id/activity', get_Controller.api_getUserActivityInfo);

// USER SETTING
router.get('/settings/info', user_check.check_login, get_Controller.api_getSettinginfo);
router.get('/settings/config', user_check.check_login, get_Controller.api_getSettingConfig);

router.put('/settings/nickname', user_check.check_login, set_Controller.api_putSettingNickname);
router.put('/settings/social', user_check.check_login, set_Controller.api_putSettingSocial);
router.put('/settings/password', user_check.check_login, set_Controller.api_putSettingPassword);

// USER WITHDRAW
router.delete('/signout', user_check.check_login, ( req, res, next ) => {
    // 개발 환경 체크 ( PROD === 회원탈퇴 처리 생략 )
    if( JSON.parse(process.env.HTTPS) ){
        return res.redirect(`/`);
    }
    next();
},set_Controller.api_WithdrawAccount); //withdrawAccount




module.exports = router;