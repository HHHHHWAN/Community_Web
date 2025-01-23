// models/redis_connect.js

const redis = require("redis");

// client 정보 
const client = redis.createClient({
    socket: {
        host: 'DB_redis'
    }
});

client.connect()
    .then(() => console.log('Redis Connect Success'))
    .catch(err => console.log('Redis Connect Failed : ',err));



module.exports = client;