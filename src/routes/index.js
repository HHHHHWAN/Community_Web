const express = require('express');
const router = express.Router();
require('dotenv').config();


const main_Controller = require('../controllers/mypage_main_ctl'); 

const user_Controller = require('../controllers/user_ctl');
const get_Controller = require('../controllers/forum_list_get');
const set_Controller = require('../controllers/forum_list_set');

const urlType_Check = require('../middleware/url_content_check');
const login_Check = require('../middleware/user_check');
const upload = require('../middleware/upload_multer');

// ------------------------------------------------------------

// 로그인 관련
router.get('/login',user_Controller.getLogin_page);
router.get('/signup',user_Controller.getSignUp_page);
router.post('/login',user_Controller.setLogin_page); 
router.post('/signup', (req,res,next) =>{
    if( process.env.HTTPS ){
        return res.redirect('log_in.ejs');
    }

    next();
}, user_Controller.setSignUp_page); 

router.get('/logout',user_Controller.getLogout);

router.get('/login/:social_url',user_Controller.getSocialLogin);
router.get('/login/:social_url/callback',user_Controller.setSocialLogin);

//openWeatherApi
router.get('/api/weather', async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const city = req.query.city || undefined;

    try{
        var api_Response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`);
        if(city){
            api_Response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`);
        }

        if(!api_Response.ok){
            throw new Error(`API HTTP error ! status : ${api_Response.status}`)
        }

        const data = await api_Response.json();

        res.json(data);
    }catch (err){
        console.error("('/api/weather') api.openweather Response Error : ",err.message);
        res.status(500).json({error: err.message});
    }
});

// API POST LIST GET
router.put('/api/settings/nickname', login_Check, user_Controller.api_setSettingNickname);
router.get('/api/settings/info', login_Check, user_Controller.api_getSettinginfo);
router.get('/api/settings', login_Check, user_Controller.api_getSettingConfig);
router.get('/api/:pagetype', urlType_Check, get_Controller.api_getContents);


// ( 요청 url, 실행될 메서드 )
router.get('/' ,main_Controller.getMyPagelist); // app urlconf

// get popular page 
router.get('/popular', get_Controller.getTypeContents);
router.get('/search', get_Controller.get_SearchContents);

// userinfo
router.get('/user/settings', login_Check, (req, res) => {
    res.render('forum_setting.ejs');
});
router.get('/user/:user_id/:user_category?', user_Controller.getUserinfo);

// postlist
router.get('/:pagetype', urlType_Check, get_Controller.getTypeContents);

// delete post
router.delete('/delete/:content_id', set_Controller.setInvisiblyctl);


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

// EDIT EJS GET
router.get('/:pagetype/edit/:content_id?', login_Check, urlType_Check, get_Controller.getCreateContent);

// EIDT UPLOAD POST  
router.post('/:pagetype/edit/:content_id?' , login_Check, urlType_Check, set_Controller.setCreateContent);


// Post GET
router.get('/:pagetype/:id', urlType_Check, get_Controller.getDetailContents);



module.exports = router;