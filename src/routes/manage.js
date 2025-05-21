const express = require('express');
const router = express.Router();

/// ctl
const manage_set_Controller = require('../controllers/manage_set_ctl');
const manage_get_Controller = require('../controllers/manage_get_ctl');

/// middleware 
const user_check = require('../middleware/user_check');


/// API 
router.put('/post', user_check.check_authority, manage_set_Controller.putPostCategory);
router.delete('/post', user_check.check_authority, manage_set_Controller.delPost);
router.delete('/comment', user_check.check_authority, manage_set_Controller.delComment);

/// SSR

router.get('/issue', ( req, res ) =>{
    res.render('forum_issue.ejs');
});




module.exports = router;