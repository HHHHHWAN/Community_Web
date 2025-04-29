const express = require('express');
const router = express.Router();
require('dotenv').config();

const redis_client = require('../models/redis_connect');

///controller
// const main_Controller = require('../controllers/mypage_main_ctl'); 
// const user_Controller = require('../controllers/user_ctl');
// const set_Controller = require('../controllers/post_set_ctl');
const get_Controller = require('../controllers/post_get_ctl');


// const api_Controller = require('../controllers/api_ctl');

///middleware
const urlType_Check = require('../middleware/url_content_check');
// const user_check = require('../middleware/user_check');


/// API ---

//openWeatherApi
router.get('/weather', async (req, res) => {
    const lat = parseFloat(req.query.lat) || 37.5;
    const lon = parseFloat(req.query.lon) || 126.9;

    // 위치 권한 off === 'Seoul' 고정
    const city = req.query.city; 
    const cacheKey = 'mainpage:weather';

    try{

        if( city && redis_client.isReady ){
            const cache_data =  await redis_client.get(cacheKey);
            if (cache_data){
                return res.json({
                    message : "API 요청 성공",
                    result : true, 
                    data : JSON.parse(cache_data)
                });
            }
        }

        let request_url = city
            ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}`
            : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`;


        const api_Response = await fetch(request_url);
        const weather_data = await api_Response.json();

        if(!api_Response.ok){
            throw new Error(`${api_Response.status}, lat = ${lat}, lon = ${lon}, city = ${city},\nrequest_url = ${request_url}`);
        }

        if( city && redis_client.isReady ){
            redis_client.setEx(cacheKey, 600, JSON.stringify(weather_data));
        }

        res.json({
            message : "API 요청 성공",
            result : true, 
            data : weather_data
        });

    }catch (err){
        console.error("('/api/weather') api.openweather Response Error : ", err.message);
        res.status(500).json({
            message : "API 요청을 실패하였습니다.",
            result : false, 
        });
    }
});

// POST LIST
router.get('/:pagetype', urlType_Check, get_Controller.api_getContents);




module.exports = router;