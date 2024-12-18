// models/redis_connect.js

const redis = require("redis");

// client 정보 
const client = redis.createClient({
    // url: 'redis://127.0.0.1:6379',
    socket: {
        host: 'DB_redis',
        port: 6379,
    }
});




// 인증 및 비밀번호 
// const redis = new Redis({
//     host: '127.0.0.1',
//     port: 6379,
//     password: 'yourpassword',
// });

client.connect()
    .then(() => console.log('Redis Connect Success'))
    .catch(err => console.log('Redis Connect Failed : ',err));



module.exports = client;