require('dotenv').config(); 
const session = require('express-session'); 
const RedisStore_object = require('connect-redis').default; 
const redis_client = require('../models/redis_connect'); 

let store_setting = new RedisStore_object({
    client : redis_client,
    prefix : 'user:'
});



const setting_session = () => {
    const session_config = session({
        secret : process.env.SESSION_SECRET, 
        resave : false, 
        saveUninitialized : false,
        proxy : true,
        store : store_setting,
        cookie: { 
            httpOnly : true, 
            sameSite : 'lax', 
            secure: JSON.parse(process.env.HTTPS),  
            maxAge: 1000 * 60 * 30 
        }
    });
    return session_config;
}

let session_object = setting_session();


let first_connect = false;

redis_client.on('ready', () => {
    console.log("Redis ( Read, Write ) Connect Success");

    first_connect = true;

    store_setting = new RedisStore_object({
        client : redis_client,
        prefix : 'user:'
    });
    session_object = setting_session();

    //once 재등록
    redis_client.once('error', () => {
        console.error("+++++++++");
        console.error("Redis Connect Fail *");
        console.error("Redis 장애 발생 => 기본 메모리 세션 사용처리");
        // console.log('connect on? :',redis_client.isOpen,'\nconnect ready? :',redis_client.isReady);
        store_setting = new session.MemoryStore();
        session_object = setting_session();
    });
});



// ERROR, DOWN STATUS ( 서버 기동 중, 한번)
redis_client.once('error', () => {
    if(!first_connect){
        console.error("+++++++++");
        console.error("Redis Connect Fail *");
        console.error("Redis 장애 발생 => 기본 메모리 세션 사용처리");
        store_setting = new session.MemoryStore();
        session_object = setting_session();
    }
});

redis_client.on('error', () => {
    // 재연결 요청용 계속 반복 됨
});




module.exports = () => (req, res, next) => session_object(req, res, next);