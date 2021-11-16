const express = require('express');
const router = express.Router();
const OAuth = require('../../service/auth/console/oauthservice');
const client = new OAuth();
const RestMsg = require('../../common/restmsg');

router.all('*', (req, res, next) => { // 鉴权
    const rm = new RestMsg();
    if (req.query.code) {
        req.session.code = req.query.code;
    }
    if (req.session.AccountCenterSDK && req.session.AccountCenterSDK.userInfo && req.session.AccountCenterSDK.userInfo.uid) {
        next();
    } else if (req.session.code) {
        client.getUserByCode(req.session, req.query.redirect_uri, (err, ret) => {
            if (err) {
                console.error('B端授权失败：');
                console.error(err);
                rm.errorMsg();
                res.status(rm.code).send(rm);
            }
            req.session = ret;
            next();
        })
    } else {
        rm.setResult(client.getAuthorizeCode(req.query.redirect_uri));
        rm.authMsg();
        res.send(rm);
    }
});

router.route('/menus')
    .get((req, res) => {
        const rm = new RestMsg();
        const accessToken = req.session.AccountCenterSDK.accessToken;
        client.getAppsNodes(accessToken, (err, remoteRet) => {
            if (err) {
                console.error('菜单权限请求失败：');
                console.error(err);
                rm.errorMsg();
                res.status(rm.code).send(rm);
            } else {
                if (remoteRet.code === 200) {
                    const menus = [];
                    if (remoteRet.result && remoteRet.result.length) {
                        const menuRights = remoteRet.result[0].appnodes;
                        for (let i = 0; i < menuRights.length; i++) { // 遍历拥有权限的菜单
                            menus.push({uri: menuRights[i].uri, name: menuRights[i].name, icon: menuRights[i].icon});
                        }
                    }
                    rm.setResult(menus);
                    rm.successMsg();
                    res.send(rm);
                } else {
                    console.error('菜单权限请求错误：');
                    console.error(remoteRet.msg);
                    rm.errorMsg();
                    res.status(rm.code).send(rm);
                }
            }
        })
    });

module.exports = router;
