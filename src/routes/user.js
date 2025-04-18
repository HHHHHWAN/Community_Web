const express = require('express');
const router = express.Router();
require('dotenv').config();

///controller
// const main_Controller = require('../controllers/mypage_main_ctl'); 
const user_Controller = require('../controllers/user_ctl');
// const get_Controller = require('../controllers/forum_list_get');
// const set_Controller = require('../controllers/forum_list_set');

//middleware
// const urlType_Check = require('../middleware/url_content_check');
const user_check = require('../middleware/user_check');



/// GET SSR
router.get('/user/settings', user_check.check_login, (req, res) => {
    res.render('forum_setting.ejs');
});
router.get('/user/:user_id', user_Controller.getUserinfo);


///api
router.get('/user/bookmark/list', user_check.check_login, user_Controller.api_getBookmark_list);
router.get('/user/bookmark/:content_id', user_check.check_login, user_Controller.api_getBookmark);
router.post('/user/bookmark/:content_id', user_check.check_login, user_Controller.api_setBookmark);
router.delete('/user/bookmark/:content_id', user_check.check_login, user_Controller.api_delBookmark);




router.get('/user/:user_id/posting', user_Controller.api_getUserPostingInfo);
router.get('/user/:user_id/activity', user_Controller.api_getUserActivityInfo);

router.get('/settings/info', user_check.check_login, user_Controller.api_getSettinginfo);
router.get('/settings/config', user_check.check_login, user_Controller.api_getSettingConfig);


router.put('/settings/nickname', user_check.check_login, user_Controller.api_putSettingNickname);
router.put('/settings/social', user_check.check_login, user_Controller.api_putSettingSocial);
router.put('/settings/password', user_check.check_login, user_Controller.api_putSettingPassword);

router.delete('/signout', user_check.check_login, ( req, res, next ) => {
    // 개발 환경 체크 ( PROD === 회원탈퇴 처리 생략 )
    if( JSON.parse(process.env.HTTPS) ){
        return res.redirect(`/`);
    }
    next();
},user_Controller.api_WithdrawAccount); //withdrawAccount




module.exports = router;