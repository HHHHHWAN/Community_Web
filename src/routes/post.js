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
const user_check = require('../middleware/user_check');
const upload = require('../middleware/upload_multer');


///----------------------------------------------------------------------

// ADD COMMENT
router.post('/reply/edit', user_check.check_login ,set_Controller.setAddComment);
// PUT COMMENT
router.put('/reply/update', user_check.check_login ,set_Controller.putUpdateComment);
// DELETE COMMENT
router.delete('/reply/delete', user_check.check_login, set_Controller.deleteComment);

// UPLOAD IMAGE
router.post('/post/upload' , user_check.check_login, upload.single('image'), (req, res) => {
    res.json({ 
        message: '업로드 성공' ,
        filePath : `/upload/${req.file.filename}`,
        result : true
    }); 
});

// ADD POST
router.post('/post/edit' , user_check.check_login, set_Controller.setAddContent);
// MODIFY POST
router.put('/post/update' , user_check.check_login, set_Controller.putUpdateContent);
// DELETE POST
router.delete('/post/delete', user_check.check_login, set_Controller.deleteContent);
// GET EDIT POST PAGE
router.get('/post/edit/:content_id?', user_check.check_login, urlType_Check, get_Controller.getCreateContent);


// GET MAIN PAGE
router.get('/' ,main_Controller.getMyPagelist); 
// GET POPULAR LIST PAGE
router.get('/popular', get_Controller.getTypeContents);
// GET SEARCH RESULT PAGE
router.get('/search', get_Controller.get_SearchContents);
// GET POST LIST PAGE
router.get('/:pagetype', urlType_Check, get_Controller.getTypeContents);
// GET POST DETAIL PAGE
router.get('/:pagetype/:content_id', urlType_Check, get_Controller.getDetailContents);



module.exports = router;