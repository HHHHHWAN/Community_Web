const express = require('express');
const router = express.Router();
require('dotenv').config();

//controller
const auth_Controller = require('../controllers/auth_ctl');

//middleware
const user_check = require('../middleware/user_check');

/// SSR ---
router.get('/login', user_check.check_logout, auth_Controller.getLogin_page);
router.get('/signup', user_check.check_logout, auth_Controller.getSignUp_page);


// REDIRECT ---
router.get('/login/:social_url', auth_Controller.getSocialLogin);
router.get('/login/:social_url/callback', auth_Controller.setSocialLogin);
router.post('/signup', user_check.check_logout, (req, res, next) =>{
    // 개발 환경 체크 ( PROD === 회원가입 처리 생략 )
    if( JSON.parse(process.env.HTTPS) ){
        return res.redirect(`/login`);
    }
    next();
}, auth_Controller.setSignUp); 

/// API ---
router.post('/login', user_check.check_logout, auth_Controller.setLogin);
router.delete('/logout', user_check.check_login, auth_Controller.getLogout);


module.exports = router;