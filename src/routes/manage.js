const express = require('express');
const router = express.Router();

/// ctl
const manage_set_Controller = require('../controllers/manage_set_ctl');
const manage_get_Controller = require('../controllers/manage_get_ctl');

/// middleware 
const user_check = require('../middleware/user_check');


/// API 
router.post('/report', user_check.check_login, manage_set_Controller.addReport );

router.put('/post', user_check.check_authority, manage_set_Controller.putPostCategory);
router.delete('/post', user_check.check_authority, manage_set_Controller.delPost);
router.delete('/comment', user_check.check_authority, manage_set_Controller.delComment);

router.get('/list', user_check.check_authority, manage_get_Controller.getReportList);
router.get('/list/detail', user_check.check_authority, manage_get_Controller.getReportDetails);
// router.get('/complaint', user_check.check_authority);

/// SSR

router.get('/issue',user_check.check_authority, ( req, res ) =>{
    res.render('forum_issue.ejs');
});




module.exports = router;