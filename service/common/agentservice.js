/**
 * 远程http请求通用service
 */
const superagent = require('superagent');

function AgentService() {

}

/**
 * 远程http请求通用
 *
 * @param url
 * @param method
 * @param data
 * @param header
 * @param logNeeded
 * @param timeout
 * @returns {Promise.<*>}
 */
AgentService.request = async (url, method, data, header = {}, logNeeded = true, timeout = 30000) => {
    console.log('调用远程接口：' + method.toUpperCase() + ' ' + url);
    if (logNeeded) {
        console.log('传参为：' + JSON.stringify(data));
    }
    console.log('header为：' + JSON.stringify(header));
    method = method.toLowerCase();
    let dataPassWay = 'send';
    if (['get', 'del'].includes(method)) {
        dataPassWay = 'query';
    }
    try {
        const res = await superagent[method](url).set(header).type('application/json')[dataPassWay](data).type('form').timeout(timeout);
        console.log('远程接口 ' + method.toUpperCase() + ' ' + url + ' 请求成功并返回：');
        if (logNeeded) {
            console.log(JSON.stringify(res.body || res.text));
        }
        return res.body || res.text;
    } catch (err) {
        console.error('远程接口 ' + method.toUpperCase() + ' ' + url + ' 请求失败');
        console.error(err);
        throw err;
    }
};

/**
 * 远程http请求：GET
 *
 * @param url
 * @param query
 * @param header
 * @param logNeeded
 * @param timeout
 * @returns {Promise.<*>}
 */
AgentService.get = async (url, query = {}, header = {}, logNeeded = true, timeout = 30000) => {
    console.log('调用远程接口：GET' + url);
    if (logNeeded) {
        console.log('传参为：' + JSON.stringify(query));
    }
    console.log('header为：' + JSON.stringify(header));
    try {
        const res = await superagent.get(url).set(header).type('application/json').query(query).timeout(timeout);
        console.log('远程接口 GET ' + url + ' 请求成功并返回：');
        if (logNeeded) {
            console.log(JSON.stringify(res.body || res.text));
        }
        return res.body || res.text;
    } catch (err) {
        console.error('远程接口 GET ' + url + ' 请求失败');
        console.error(err);
        throw err;
    }
};

/**
 * 远程http请求：POST
 *
 * @param url
 * @param data
 * @param header
 * @param logNeeded
 * @param timeout
 * @returns {Promise.<*>}
 */
AgentService.post = async (url, data, header = {}, logNeeded = true, timeout = 30000) => {
    console.log('调用远程接口：POST' + url);
    if (logNeeded) {
        console.log('传参为：' + JSON.stringify(data));
    }
    console.log('header为：' + JSON.stringify(header));
    try {
        const res = await superagent.post(url).set(header).type('application/json').send(data).timeout(timeout);
        console.log('远程接口 POST ' + url + ' 请求成功并返回：');
        if (logNeeded) {
            console.log(JSON.stringify(res.body || res.text));
        }
        return res.body || res.text;
    } catch (err) {
        console.error('远程接口 POST ' + url + ' 请求失败');
        console.error(err);
        throw err;
    }
};

module.exports = AgentService;
