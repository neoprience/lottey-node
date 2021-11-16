/**
 * redis工具类
 * @param redisClient redis客户端
 */
function RedisOperator() {

}

RedisOperator.generate = redisClient => {
    const redis = {};

    /**
     * 获取value
     * @param key
     */
    redis.getValue = async key => {
        return await redisClient.get(key);
    };

    /**
     * 获取hash
     * @param key
     */
    redis.getHash = async key => {
        return await redisClient.hgetall(key);
    };

    /**
     * 根据key、value存储到redis
     * @param key
     * @param value
     * @param expire 过期时间 单位：秒
     */
    redis.setValue = (key, value, expire) => {
        redisClient.set(key, value);
        if (expire) {
            redisClient.expire(key, expire);
        }
    };

    /**
     * 根据key删除
     * @param key
     */
    redis.deleteValue = key => {
        redisClient.del(key);
    };

    return redis;
};

module.exports = RedisOperator;
