const express = require('express');
const router = express.Router(); // url 넘기기용 

//view controller 객체 생성
const main_Controller = require('../controllers/mypage_main_ctl'); 
//게시판 컨트롤러
// const list_Controller = require('../controllers/forum_list_ctl');
const user_Controller = require('../controllers/user_ctl');


// 모듈화 테스트 컨트롤러 

const get_Controller = require('../controllers/forum_list_get');
const set_Controller = require('../controllers/forum_list_set');

//게시판 url 타입 체크 미들웨어
const urlType_Check = require('../middleware/url_content_check');
const login_Check = require('../middleware/user_check');
// ------------------------------------------------------------

// 로그인 관련
router.get('/login',user_Controller.getLogin_page);
router.get('/signup',user_Controller.getSignUp_page);
router.post('/login',user_Controller.setLogin_page); // 로그인 요청 
router.post('/signup',user_Controller.setSignUp_page); // 회원가입 요청

router.get('/logout',user_Controller.getLogout);

router.get('/login/:social_url',user_Controller.getSocialLogin);
router.get('/login/:social_url/callback',user_Controller.setSocialLogin);

//api 호출 라우터
router.get('/api/:pagetype',urlType_Check, get_Controller.api_getContents);


// ( 요청 url, 실행될 메서드 )
router.get('/' ,main_Controller.getMyPagelist); // app urlconf

// get popular page 
router.get('/popular', get_Controller.getTypeContents);
router.get('/search', get_Controller.get_SearchContents);

router.get('/testpage', (req, res) => {
    res.render('testpage',{ layout : false });
});


//user info
router.get('/user/:user_id/:user_category?', user_Controller.getUserinfo);

// get forum contents list 
router.get('/:pagetype', urlType_Check , get_Controller.getTypeContents);


// 게시글 삭제, 비활성 처리
router.delete('/delete/:content_id', set_Controller.setInvisiblyctl);

// 게시글 작성 페이지
router.get('/:pagetype/edit', login_Check, urlType_Check , get_Controller.getCreateContent);
// 게시글  
router.post('/:pagetype/edit' , login_Check ,urlType_Check ,set_Controller.setCreateContent);

// 게시글 내용
router.get('/:pagetype/:id',urlType_Check, get_Controller.getDetailContents);

router.post('/reply/edit/:comment_id',login_Check, set_Controller.setCreateComment);
router.delete('/reply/delete/:comment_id', login_Check, set_Controller.setInvisiblyctl);

// 게시글 코멘트 작성
router.post('/reply/:contents_id/:comment_id?', login_Check ,set_Controller.setCreateComment);





module.exports = router;