const config = require('../../config');

module.exports = {
    accessKey: config.servers.upload.accessKey,
    secretKey: config.servers.upload.secretKey,
    isRemote: !(config.env === 'development'),
    localUrl: 'http://127.0.0.1:' + config.http_port + '/',
    localContext: ''
};
