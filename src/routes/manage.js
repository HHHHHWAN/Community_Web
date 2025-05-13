const express = require('express');
const router = express.Router();

/// ctl
const manage_Controller = require('../controllers/manage_ctl');

/// middleware 
const urlType_Check = require('../middleware/url_content_check');


/// API 

router.put('/post', manage_Controller.putPostCategory);
router.delete('/post', manage_Controller.delPost);
router.delete('/comment', manage_Controller.delComment);






module.exports = router;