const express = require('express');
const router = express.Router();
require('dotenv').config();

//controller
const auth_Controller = require('../controllers/auth_ctl');

//middleware
const user_check = require('../middleware/user_check');

// GET EJS
router.get('/login', user_check.check_logout, auth_Controller.getLogin_page);
router.get('/login/:social_url', user_check.check_logout, auth_Controller.getSocialLogin);
router.get('/login/:social_url/callback', user_check.check_logout, auth_Controller.setSocialLogin);
router.get('/signup', user_check.check_logout, auth_Controller.getSignUp_page);


router.post('/login', user_check.check_logout, auth_Controller.setLogin_page); 
router.post('/signup', user_check.check_logout, (req, res, next) =>{
    // PROD 환경 체크 ( PROD === 회원가입 처리 X )
    if( JSON.parse(process.env.HTTPS) ){
        return res.redirect(`/login`);
    }
    next();
}, auth_Controller.setSignUp_page); 


router.delete('/logout', user_check.check_login, auth_Controller.getLogout);


module.exports = router;