require('dotenv').config(); 
const session = require('express-session'); 
const RedisStore_object = require('connect-redis').default; 
const redis_client = require('../models/redis_connect'); 


function session_config(){
    return session({
        secret : process.env.SESSION_SECRET, 
        resave : false, 
        saveUninitialized : false,
        proxy : true,
        store : new RedisStore_object({ 
            client : redis_client,
            prefix : 'user:'
        }),
        cookie: { 
            httpOnly : true, 
            sameSite : 'lax', 
            secure: JSON.parse(process.env.HTTPS),  
            maxAge: 1000 * 60 * 30 
        }
    });
}


module.exports = session_config;