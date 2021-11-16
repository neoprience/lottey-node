/**
 * mongodb数据库连接
 */
const mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;
mongoose.connect(config.db.mongo.url_prefix + config.appId + config.db.mongo.url_suffix, {
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 3000,
    poolSize: 5,
    useNewUrlParser: true,
    useCreateIndex: true
});

module.exports = mongoose;
