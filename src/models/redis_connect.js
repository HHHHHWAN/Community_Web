// models/redis_connect.js
require('dotenv').config();
const redis = require("redis");

// client 정보 
const redis_config = () => {
    const client = redis.createClient({
        socket: {
            host: 'DB_redis'
        },
        password: process.env.DB_REDIS_PASSWORD,
    });
    
    return client
}
const redis_client = redis_config();


redis_client.connect()
    .then(()=>{
        // console.log("Redis ( Read, Write ) Connect Success");
    })
    .catch();
    // console.error("Redis Connect Fail *")   



module.exports = redis_client;