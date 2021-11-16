/**
 * 消息通知通用service
 */
const AgentService = require('./agentservice');
const config = require('../../config');

function NoticeService() {

}

/**
 * 消息推送：单播
 *
 * @param url
 * @param method
 * @param notiid
 * @param title
 * @param clients
 * @param sstatus
 * @param ssysname
 * @param rusers
 * @param desctype
 * @param desc
 * @returns {Promise.<boolean>}
 */
NoticeService.pushMsg = async (url, method, {notiid, title, clients = ['app'], sstatus, ssysname, rusers, desctype = 'txt', desc}) => {
    if (!notiid || !title || !ssysname || !rusers) {
        throw new Error('缺少推送参数');
    } else {
        try {
            const params = {
                appsecret: config.app.oauth.appsecret,
                notiid,
                title,
                clients,
                sstatus: {desc},
                ssysid: config.app.oauth.appkey,
                ssysname,
                rusers: typeof rusers === 'string' ? [rusers] : rusers,
                desctype,
                desc
            };
            const ret = await AgentService.request(url, method, params);
            if (ret.code === 1) {
                return true;
            } else {
                console.error('消息推送失败，接口返回：');
                console.error(JSON.stringify(ret));
                return false;
            }
        } catch (err) {
            console.error('消息推送失败：');
            console.error(err);
            return false;
        }
    }
};

module.exports = NoticeService;
