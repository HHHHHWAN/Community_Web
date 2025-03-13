const express = require('express');
const router = express.Router();
require('dotenv').config();

const redis_client = require('../models/redis_connect');

///controller
// const main_Controller = require('../controllers/mypage_main_ctl'); 
// const user_Controller = require('../controllers/user_ctl');
// const set_Controller = require('../controllers/post_set_ctl');
const get_Controller = require('../controllers/post_get_ctl');


const api_Controller = require('../controllers/api_ctl');

///middleware
const urlType_Check = require('../middleware/url_content_check');
const user_check = require('../middleware/user_check');


///-----------------------------------------------------------------------

router.get('/settings/info', user_check.check_login, api_Controller.api_getSettinginfo);
router.get('/settings', user_check.check_login, api_Controller.api_getSettingConfig);

//openWeatherApi
router.get('/weather', async (req, res) => {
    const lat = parseFloat(req.query.lat) || 37.5;
    const lon = parseFloat(req.query.lon) || 126.9;
    const city = req.query.city;
    const cacheKey = 'mainpage:weather';

    try{

        if( city && redis_client.isReady ){
            const cache_data =  await redis_client.get(cacheKey);
            if (cache_data){
                console.log("weather cache !!")
                return res.json(JSON.parse(cache_data));
            }
        }

        let request_url = city
            ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
            : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`;


        const api_Response = await fetch(request_url);


        const data = await api_Response.json();

        if(!api_Response.ok){
            throw new Error(`API HTTP error ! status : ${api_Response.status}`)
        }

        if( city && redis_client.isReady ){
            redis_client.setEx(cacheKey, 600, JSON.stringify(data));
        }

        res.json(data);

    }catch (err){
        console.error("('/api/weather') api.openweather Response Error : ", err.message);
        res.status(500).json({error: err.message});
    }
});

// ENUM ( 'info', 'qa, 'life')
router.get('/:pagetype', urlType_Check, get_Controller.api_getContents);


router.put('/settings/password', user_check.check_login, api_Controller.api_putSettingPassword);
router.put('/settings/nickname', user_check.check_login, api_Controller.api_putSettingNickname);
router.put('/settings/social', user_check.check_login, api_Controller.api_putSettingSocial);


module.exports = router;