'use strict';
const urllib = require('urllib');
const extend = require('util')._extend;
const querystring = require('querystring');
const config = require('./oauthconfig');

/**
 * 根据appkey和appsecret创建OAuth接口的构造函数
 * 如需跨进程跨机器进行操作，access token需要进行全局维护
 * 使用使用token的优先级是：
 *
 * 1. 使用当前缓存的token对象
 * 2. 调用开发传入的获取token的异步方法，获得token之后使用（并缓存它）。
 * Examples:
 * ```
 * var api = new OAuth('appkey', 'secret');
 * ```
 * @param {Function} saveToken 用于保存token的方法
 */
var OAuth = function () {
    this.appkey = config.appkey;
    this.appsecret = config.appsecret;
    // token的获取和存储
    this.store = {};
    this.defaults = {};
};

/**
 * 用于设置urllib的默认options
 *
 * Examples:
 * ```
 * oauth.setOpts({timeout: 15000});
 * ```
 * @param {Object} opts 默认选项
 */
OAuth.prototype.setOpts = function (opts) {
    this.defaults = opts;
};

/*!
 * urllib的封装
 *
 * @param {String} url 路径
 * @param {Object} opts urllib选项
 * @param {Function} callback 回调函数
 */
OAuth.prototype.request = function (url, opts, callback) {
    var options = {};
    extend(options, this.defaults);
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    }
    for (var key in opts) {
        if (key !== 'headers') {
            options[key] = opts[key];
        } else {
            if (opts.headers) {
                options.headers = options.headers || {};
                extend(options.headers, opts.headers);
            }
        }
    }
    if (options.method === 'POST') {
        options.data = {
            data: JSON.stringify(options.data)
        }
    }
    options.timeout = 12000;
    urllib.request(url, options, callback);
};

/**
 * 获取授权页面的code
 * @param {String} state 用户自定义参数，不作处理后会拼接返回
 */
OAuth.prototype.getAuthorizeCode = function (redirect, state = '') {
    var info = {
        appid: this.appkey,
        redirect_uri: redirect,
        state: state,
    };

    return config.baseurl.authorize + '?' + querystring.stringify(info);
};

/**
 * 删除运营平台的session并且返回登录页
 * @param {String} state 用户自定义参数，不作处理后会拼接返回
 */
OAuth.prototype.getClearAuthorizeCode = function (redirect, state) {
    var info = {
        appid: this.appkey,
        redirect_uri: redirect,
        state: state,
    };

    return config.baseurl.authorize + '?type=logout&' + querystring.stringify(info);
};

/**
 * 根据授权session获取AccessToken
 * Examples:
 * ```
 * api.getAccessToken(session, callback);
 * ```
 * @param {String} session 授权获取到的code
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getAccessToken = function (session, redirect, callback) {
    var info = {
        appid: this.appkey,
        secret: this.appsecret,
        code: session.code,
        redirect_uri: redirect,
    };
    delete session.code;
    var url = config.baseurl.token + '?' + querystring.stringify(info)
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

/**
 * 根据用户名和token获取用户基本信息。
 * Examples:
 * ```
 * api.getUserBaseInfo(accessToken, callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getUserBaseInfo = function (accessToken, callback) {
    var info = {
        access_token: accessToken
    };
    var url = config.baseurl.baseinfo + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

/**
 * 根据用户名和token获取身份信息。
 * Examples:
 * ```
 * api.getUserIdentity(accessToken, callback);
 * ```
 * @param {String} user 授权获取到的user
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getUserIdentity = function (accessToken, callback) {
    var info = {
        access_token: accessToken
    };
    var url = config.baseurl.identity + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json',
        timeout: 10000
    };
    this.request(url, args, callback);
};

/**
 * 根据session获取用户信息。
 * Examples:
 * ```
 * api.getUserByCode(session, callback);
 * ```
 * @param {Object|String} session
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getUserByCode = function (session, redirect, callback) {
    var that = this;
    if (!session.AccountCenterSDK || !session.AccountCenterSDK.accessToken) {
        console.log('getAccessToken');
        that.getAccessToken(session, redirect, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (result.error) {
                return callback(result.error);
            }
            session.AccountCenterSDK = {};
            session.AccountCenterSDK.accessToken = result.result.access_token;
            console.log('AccountCenterSDK.accessToken:' + session.AccountCenterSDK.accessToken);
            that.getUserIdentity(result.result.access_token, function (err, info) {
                if (err) {
                    return callback(err);
                }
                if (info.error) {
                    return callback(info.error);
                }
                session.AccountCenterSDK['userInfo'] = info.result;
                callback(null, session);
            })
        });
    } else {
        return callback(null, session);
    }
};

/**
 * 根据token，来获取当前子系统接入服务的权限清单
 * Examples:
 * ```
 * api.getBossInApps(accessToken,bid, callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
//缺少当前子系统的bid
OAuth.prototype.getBossInApps = function (accessToken, bid, callback) {
    var info = {
        access_token: accessToken,
        bid: bid
    };
    var url = config.baseurl.bossinapps + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

/**
 * 根据token来获取用户当前子系统有权限的组织架构信息
 * Examples:
 * ```
 * api.getBossInOrgs(accessToken,bid, callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getBossInOrgs = function (accessToken, bossid, callback) {
    var info = {
        access_token: accessToken,
        bid: bossid
    };
    var url = config.baseurl.bossinorgs + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};
/**
 * 根据token，来获子系统完整组织架构信息
 * Examples:
 * ```
 * api.getBossAllOrgs(accessToken,bid, callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getBossAllOrgs = function (accessToken, bid, saasid, callback) {
    var info = {
        access_token: accessToken,
        bid: bid,
        saasid: saasid
    };
    var url = config.baseurl.bossallorgs + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};
/**
 * 根据token，来获子系统信息
 * Examples:
 * ```
 * api.getBossInfo(accessToken,bid, callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getBossInfo = function (accessToken, bid, callback) {
    var info = {
        access_token: accessToken,
        bid: bid
    };
    var url = config.baseurl.bossinfo + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

/**
 * 根据token，获取服务信息
 * Examples:
 * ```
 * api.getAppsNodes(accessToken,callback);
 * ```
 * @param {String} accessToken 授权获取到的accessToken
 * @param {Function} callback 回调函数
 */
OAuth.prototype.getAppsNodes = function (accessToken, callback) {
    var info = {
        access_token: accessToken,
        aid: config.appkey
    };
    var url = config.baseurl.appsnodeuser + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

/**
 * 退出登录，携带cookies和accessToken，第三方服务请使用getClearAuthorizeCode
 * Examples:
 * ```
 * api.loguut(accessToken,callback);
 * ```
 * @param {String} accessToken 登出
 * @param {Function} callback 回调函数
 */
OAuth.prototype.logout = function (cookies, accessToken, callback) {
    var info = {
        access_token: accessToken,
        cookies: cookies
    };
    var url = config.baseurl.logout + '?' + querystring.stringify(info);
    var args = {
        dataType: 'json'
    };
    this.request(url, args, callback);
};

module.exports = OAuth;
