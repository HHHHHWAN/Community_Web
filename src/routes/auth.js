const express = require('express');
const router = express.Router();
require('dotenv').config();

//controller
// const main_Controller = require('../controllers/mypage_main_ctl'); 
// const user_Controller = require('../controllers/user_ctl');
// const get_Controller = require('../controllers/post_get_ctl');
// const set_Controller = require('../controllers/post_set_ctl');

const auth_Controller = require('../controllers/auth_ctl');

//middleware
const urlType_Check = require('../middleware/url_content_check');
const user_check = require('../middleware/user_check');

// GET EJS
router.get('/login', user_check.check_logout, auth_Controller.getLogin_page);
router.get('/login/:social_url',auth_Controller.getSocialLogin);
router.get('/login/:social_url/callback',auth_Controller.setSocialLogin);



router.get('/signup', user_check.check_logout, auth_Controller.getSignUp_page);


router.post('/login', user_check.check_logout, auth_Controller.setLogin_page); 

router.post('/signup', user_check.check_logout, (req,res,next) =>{
    if( JSON.parse(process.env.HTTPS) ){
        return res.redirect(`/login`);
    }

    next();
}, auth_Controller.setSignUp_page); 

router.get('/logout', user_check.check_login, auth_Controller.getLogout);



module.exports = router;