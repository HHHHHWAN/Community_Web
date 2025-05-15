const express = require('express');
const router = express.Router();

/// ctl
const manage_Controller = require('../controllers/manage_ctl');

/// middleware 
const user_check = require('../middleware/user_check');


/// API 

router.put('/post', user_check.check_authority, manage_Controller.putPostCategory);
router.delete('/post', manage_Controller.delPost);
router.delete('/comment', manage_Controller.delComment);






module.exports = router;