/**
 * redis数据库连接
 */
const Redis = require('ioredis');
const config = require('../config');

if (config.db.redis.singleConfig) {
    config.db.redis.singleConfig = Object.assign(config.db.redis.singleConfig, {
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
}
if (config.db.redis.clusterConfig) {
    config.db.redis.clusterConfig.options = {
        clusterRetryStrategy: function (times) { //重试时间
            var delay = Math.min(times * 2000, 60000);
            return delay;
        },
        redisOptions: {
            reconnectOnError: function (err) { //报错重连
                var targetError = 'READONLY';
                if (err.message.slice(0, targetError.length) === targetError) { //仅错误以"READONLY"开头时重连
                    return true;
                }
            },
            password: config.db.redis.clusterConfig.password
        }
    }
}
module.exports = config.db.redis.clusterConfig ? new Redis.Cluster(config.db.redis.clusterConfig.startupNodes,
    config.db.redis.clusterConfig.options) : new Redis(config.db.redis.singleConfig);
