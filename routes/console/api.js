const express = require('express');
const router = express.Router();
const OAuth = require('../../service/auth/console/oauthservice');
const client = new OAuth();
const RestMsg = require('../../common/restmsg');

router.all('*', (req, res, next) => { // 鉴权
    const rm = new RestMsg();
    if (inWhiteList(req)) {
        next();
    } else {
        const activeMenu = req.path.split('/')[1];
        const accessToken = req.session.AccountCenterSDK.accessToken;
        if (req.session.appnodes) {
            let flag = false;
            const menuRights = req.session.appnodes;
            for (let i = 0; i < menuRights.length; i++) { // 遍历拥有权限的菜单
                if (activeMenu === menuRights[i].uri.split('/')[0]) { // 若有此菜单的权限
                    flag = true;
                    break;
                }
            }
            if (flag) {
                next();
            } else {
                rm.authMsg();
                res.status(rm.code).send(rm);
            }
        } else {
            client.getAppsNodes(accessToken, (err, remoteRet) => {
                if (err) {
                    console.error('B端鉴权失败-权限接口请求失败：');
                    console.error(err);
                    rm.errorMsg();
                    res.status(rm.code).send(rm);
                } else {
                    if (remoteRet.code === 200) {
                        if (remoteRet.result && remoteRet.result.length) {
                            const menuRights = remoteRet.result[0].appnodes;
                            req.session.appnodes = menuRights;
                            let flag = false;
                            for (let i = 0; i < menuRights.length; i++) { // 遍历拥有权限的菜单
                                if (activeMenu === menuRights[i].uri.split('/')[0]) { // 若有此菜单的权限
                                    flag = true;
                                    break;
                                }
                            }
                            if (flag) {
                                next();
                            } else {
                                rm.authMsg();
                                res.status(rm.code).send(rm);
                            }
                        } else {
                            rm.authMsg();
                            res.status(rm.code).send(rm);
                        }
                    } else {
                        console.error('B端鉴权失败-权限接口返回错误：');
                        console.error(remoteRet.msg);
                        rm.errorMsg();
                        res.status(rm.code).send(rm);
                    }
                }
            })
        }
    }
});

function inWhiteList(req) {
    const whiteList = ['post/upload', 'post/imp_exp'];
    const current = req.method.toLowerCase() + req.path;
    let inWhiteList = false;
    if (whiteList.length) {
        for (let i = 0; i < whiteList.length; i++) {
            if (current.indexOf(whiteList[i]) > -1) {
                inWhiteList = true;
                break;
            }
        }
    }
    return inWhiteList;
}

const upload = require('../common/upload');
const example = require('./example/example');
const user = require('./user/user');
router.use('/upload', upload);
router.use('/users', user);
router.use('/examples', example);

module.exports = router;

