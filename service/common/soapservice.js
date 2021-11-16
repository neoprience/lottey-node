/**
 * 远程soap请求通用service
 */
const soap = require('soap');

function SoapService() {

}

/**
 * 发起soap请求
 *
 * @param {string} url 服务地址
 * @param {object} args 参数
 * @param {string} method 方法名
 * @param {object} authHeader 校验头
 * @returns {Promise.<void>}
 */
SoapService.request = function (url, args, method, authHeader, callback) {
    console.log('调用' + url + '远程接口' + method + '：');
    console.log('传参为：' + JSON.stringify(args));

    try {
        soap.createClientAsync(url).then((client) => {
            if (authHeader) {
                client.addSoapHeader({ authHeader: authHeader });
            }
            client[method](args, function (err, result) {
                if (err) {
                    console.error('远程接口请求失败：' + err);
                    callback(err);
                } else {
                    console.log('远程接口请求成功');
                    callback(null, result);
                }
            })
        });
    } catch (err) {
        console.error('远程接口 ' + method + ' 请求失败：');
        console.error(err);
        throw err;
    }
};

module.exports = SoapService;
