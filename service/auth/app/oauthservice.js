'use strict';

const urllib = require('urllib');
const querystring = require('querystring');
const config = require('../../../config');

const Const = {
    client_id: config.app.oauth.appkey
};

module.exports = {

    getAuthorizeCode: (redirectURI) => {
        const params = {
            client_id: Const.client_id,
            response_type: 'code',
            redirect_uri: redirectURI,
            scope: 'read'
        };
        return config.app.domain + config.app.oauth.authorize + '?' + querystring.stringify(params);
    },

    getAccessToken: (code, redirectURI) => {
        return new Promise((resolve, reject) => {
            const params = {
                client_id: Const.client_id,
                client_secret: config.app.oauth.appsecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectURI
            };
            const url = config.app.domain + config.app.oauth.token + '?' + querystring.stringify(params);
            request(url, (err, result) => {
                if (err) {
                    reject(err);
                }
                if (result.error) {
                    reject(new Error(result.error));
                }
                resolve(result);
            })
        })
    },

    getUserInfo: (user, accessToken) => {
        return new Promise((resolve, reject) => {
            const url = config.app.domain + config.app.oauth.identity + '/' + user + '?' + querystring.stringify({access_token: accessToken});
            request(url, (err, info) => {
                if (err) {
                    reject(err);
                }
                if (info.error) {
                    reject(new Error(info.error));
                }
                resolve(info.data);
            });
        })
    }
};

function request(url, callback) {
    urllib.request(url, {dataType: 'json', timeout: 10000}, callback);
}
