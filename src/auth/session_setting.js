require('dotenv').config(); // env 
const session = require('express-session'); // session 패키지
const RedisStore_object = require('connect-redis').default; // redis store 패키지
const redis_client = require('../models/redis_connect'); // redis 클라이언트 객체


function session_config(){
    return session({
        secret : process.env.SESSION_SECRET, // 쿠키 암호값 설정
        resave : false, //세션 데이터가 변경되지 않았을 때도 저장할지 여부
        saveUninitialized: true, 
            // 초기화되지 않은 세션도 저장할지 여부
            // true -> 세션이 없는 첫 요청이 들어올 때, 세션 객체가 고정, 생성 ( 즉 앱에 접근한 이후 고정됨)
            // false -> 세션 데이터가 수정될 때, 세션 객체가 생성, 고정 ( 즉, req.session 객체에 수정점이 있을경우)
        store : new RedisStore_object({ 
            client : redis_client,
            prefix : 'user:'
        }),
        cookie: { 
            sameSite : 'lax', // 새탭 쿠키 적용
            secure: false,  // HTTPS 환경에서는 true로 설정
            maxAge: 1000 * 60 * 30 // login time
        }
    });
}


module.exports = session_config;