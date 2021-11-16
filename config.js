'use strict';

/**
 * 本地开发环境配置
 */
module.exports = {
    env: 'development',
    http_port: 3005,
    appId: 'budnode',
    db: {
        mongo: {
            url_prefix: 'mongodb://127.0.0.1:27017/',
            url_suffix: '',
            option: {
                autoReconnect: true, // 自动重连
                reconnectTries: 5, // 重连尝试次数
                reconnectInterval: 3000, // 重连等待时间，单位ms
                poolSize: 5, // 最大连接数
                useNewUrlParser: true, // 使用新的数据库连接字符串解析器，避免mongodb服务器抛出warning
                useCreateIndex: true // 使用createIndex()创建mongoose默认索引，避免mongodb服务器抛出warning
            }
        },
        redis: {
            singleConfig: {
                host: '127.0.0.1', // 主机地址
                port: 6379, // 服务端口，6379为默认端口
                password: '',
                db: 1, // 数据库库索引，默认配置16个即索引0～15，默认使用db0
                retryStrategy: function (times) { // 重连等待时间，单位ms（times为重连次数）
                    return Math.min(times * 2000, 60000);
                },
                reconnectOnError: function (err) { //报错重连
                    const targetError = 'READONLY';
                    if (err.message.slice(0, targetError.length) === targetError) { // 仅错误以"READONLY"开头时重连
                        return true;
                    }
                }
            },
            rsaConfig: { //单节点配置
                host: '127.0.0.1', // 主机地址
                port: 6379, // 服务端口，6379为默认端口
                password: '',
                db: 1, // 数据库库索引，默认配置16个即索引0～15，默认使用db0
                retryStrategy: function (times) { // 重连等待时间，单位ms（times为重连次数）
                    return Math.min(times * 2000, 60000);
                },
                reconnectOnError: function (err) { //报错重连
                    const targetError = 'READONLY';
                    if (err.message.slice(0, targetError.length) === targetError) { // 仅错误以"READONLY"开头时重连
                        return true;
                    }
                }
            }
        }
    },
    servers: {
        upload: {
            accessKey: '562e8740-fa23-11e9-b27c-2553756ab48a',
            secretKey: 'f5817a12-a5a4-4c3c-b36e-eddfa6ff53d1',
            maxSize: {
                image: 1024 * 1024,
                audio: 1024 * 1024,
                video: 10 * 1024 * 1024
            }
        },
        uba: {
            url: 'https://cdpre.tfsmy.com/uba',
            appkey: '6f9c86defc6536a5fd5c7f8ea216ff0ad663d3bc'
        },
        push: {
            url: 'https://cdpre.tfsmy.com/notification/openapi/msg', // 单播
            method: 'POST'
        }
    },
    keys: {
        aes: 'akRHUlhVU3FrUnVx',
        des: 'eshimin@'
    },
    app: { // C 端配置
        domain: 'https://cdpre.tfsmy.com/',
        oauth: {
            appkey: 'r7HEBf5agF',
            appsecret: 'O3hrUtZU5Nlk4jP2R8Nt7xZh9PsX3vhfbTpkpehp',
            authorize: 'api/oauth/authorize', // 获取授权code
            token: 'api/oauth/token', // 根据code换取token
            identity: 'api/v2/user/identity' // 获得用户身份信息
        },
        profile: {
            url: 'realPersonAuth/real/auth',
            method: 'GET'
        }
    },
    console: { // B 端配置
        oauth: {
            baseurl: {
                authorize: 'http://cdpre.tfsmy.com/account-center/connect/oauth2/authorize/', // 授权获取code
                token: 'http://cdpre.tfsmy.com/account-center/connect/oauth2/access_token/', // 通过code换取用户信息
                baseinfo: 'http://cdpre.tfsmy.com/account-center/openapi/user/basic/', // 获得用户基本信息
                identity: 'http://cdpre.tfsmy.com/account-center/openapi/user/identity/', // 获得用户身份信息
                logout: 'http://cdpre.tfsmy.com/account-center/openapi/user/logout/', // 退出登录
                appsnodes: 'http://cdpre.tfsmy.com/account-center/openapi/apps/appsnodes/', // 获得子系统系统接入服务的权限清单
                appsnodeuser: 'http://cdpre.tfsmy.com/account-center/openapi/apps/appsnodeuser/', // 获得当前用户当前子系统当前服务的
                bossinfo: 'http://cdpre.tfsmy.com/account-center/openapi/boss/bossinfo/', // 获得子系统系统接入服务的权限清单
                bossinapps: 'http://cdpre.tfsmy.com/account-center/openapi/boss/bossinapps/', // 获得子系统系统接入服务的权限清单
                bossinorgs: 'http://cdpre.tfsmy.com/account-center/openapi/boss/bossinorgs/', // 获得子系统系统接入服务的权限清单
                bossallorgs: 'http://cdpre.tfsmy.com/account-center/openapi/boss/bossallorgs/' // 获得子系统系统接入服务的权限清单
            },
            appkey: '9jmkFNsa5FPMTlTeF3hfXAXHgQSz49YR', // 应用key，自行填写
            appsecret: 'dae72fa0-0617-11ea-b5ff-9f7f065afc9e'// 应用secret，自行填写
        }
    }
};
