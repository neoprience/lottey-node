const Redis = require('ioredis');
const config = require('../config');

config.db.redis.rsaConfig = Object.assign(config.db.redis.rsaConfig, {
    retryStrategy: function (times) { // 重连等待时间，单位ms（times为重连次数）
        return Math.min(times * 2000, 60000);
    },
    reconnectOnError: function (err) { //报错重连
        const targetError = 'READONLY';
        if (err.message.slice(0, targetError.length) === targetError) { // 仅错误以"READONLY"开头时重连
            return true;
        }
    }
});
module.exports = new Redis(config.db.redis.rsaConfig);
