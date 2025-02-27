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




// GET MAINPAGE
router.get('/' ,main_Controller.getMyPagelist); // app urlconf
// GET POPULAR LIST
router.get('/popular', get_Controller.getTypeContents);
// GET SEARCH RESULT
router.get('/search', get_Controller.get_SearchContents);



// DELETE COMMENT
router.delete('/reply/delete', user_check.check_login, set_Controller.deleteComment);
// PUT COMMENT
router.post('/reply/edit/:comment_id?', user_check.check_login ,set_Controller.setCreateComment);
// ADD COMMENT
router.post('/reply/:contents_id/:comment_id?', user_check.check_login ,set_Controller.setCreateComment);


// ADD,UPLOAD IMAGE
router.post('/post/upload' , user_check.check_login, upload.single('image'), (req, res) => {
    res.json({ 
        message: 'success' ,
        filePath : `/upload/${req.file.filename}` 
    }); 
});

// ADD POST, MODIFY
// router.post('/edit/:content_id?' , user_check.check_login, set_Controller.setCreateContent);
router.post('/post/edit' , user_check.check_login, set_Controller.setAddContent);
router.put('/post/update' , user_check.check_login, set_Controller.putUpdateContent);
// DELETE POST
router.delete('/post/delete', user_check.check_login, set_Controller.deleteContent);
// GET ADD POST EJS
router.get('/:pagetype/edit/:content_id?', user_check.check_login, urlType_Check, get_Controller.getCreateContent);


// GET POST DETAIL
router.get('/:pagetype/:id', urlType_Check, get_Controller.getDetailContents);
// GET POST LIST
router.get('/:pagetype', urlType_Check, get_Controller.getTypeContents);


module.exports = router;