const express = require('express');
const router = express.Router();
require('dotenv').config();

//controller
const main_Controller = require('../controllers/mypage_main_ctl'); 
// const user_Controller = require('../controllers/user_ctl');
const get_Controller = require('../controllers/post_get_ctl');
const set_Controller = require('../controllers/post_set_ctl');

//middleware
const urlType_Check = require('../middleware/url_content_check');
const login_Check = require('../middleware/user_check');
const upload = require('../middleware/upload_multer');







// ( 요청 url, 실행될 메서드 )
router.get('/' ,main_Controller.getMyPagelist); // app urlconf

// get popular page 
router.get('/popular', get_Controller.getTypeContents);
router.get('/search', get_Controller.get_SearchContents);



// comment delete
router.delete('/reply/delete/:comment_id', login_Check, set_Controller.setInvisiblyctl);
// comment put
router.post('/reply/edit/:comment_id?', login_Check ,set_Controller.setCreateComment);
// comment create
router.post('/reply/:contents_id/:comment_id?', login_Check ,set_Controller.setCreateComment);


//image upload
router.post('/image/upload' , login_Check, upload.single('image'), (req, res) => {
    res.json({ message: 'success' , filePath : `/upload/${req.file.filename}` }); 
});


// delete post
router.delete('/delete/:content_id', set_Controller.setInvisiblyctl);


// postlist
router.get('/:pagetype', urlType_Check, get_Controller.getTypeContents);


// EDIT EJS GET
router.get('/:pagetype/edit/:content_id?', login_Check, urlType_Check, get_Controller.getCreateContent);

// EIDT UPLOAD POST  
router.post('/:pagetype/edit/:content_id?' , login_Check, urlType_Check, set_Controller.setCreateContent);


// POST GET
router.get('/:pagetype/:id', urlType_Check, get_Controller.getDetailContents);


module.exports = router;