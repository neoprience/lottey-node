const config = require('../../config');
const encryptor = require('../../common/encryptor');
const RestMsg = require('../../common/restmsg');
const Constant = require('../../common/constant');
const AgentService = require('../../service/common/agentservice');
const AuthService = require('../../service/auth/app/oauthservice');
const UserService = require('../../service/user/userservice');

module.exports = async (req, res, next, loginNeeded = true, authNeeded = true) => {
    const rm = new RestMsg();

    try {
        if (req.session && req.session.user && req.session.user.info && req.session.user.info.idcard) {
            initUser(req.session.user.info, false);
            req.session.state = 3;
            next();
        } else {
            if (req.session.user || req.query.code) {
                if (!req.session.user) {
                    req.session.user = await AuthService.getAccessToken(req.query.code, req.query.redirect_uri);
                }
                const userInfo = await AuthService.getUserInfo(req.session.user.user, req.session.user.access_token);
                if (userInfo.idcard) {
                    req.session.user.info = userInfo;
                    req.session.state = 3;
                    initUser(userInfo);
                    next();
                } else {
                    if (authNeeded) {
                        rm.authMsg();
                        res.status(rm.code).send(rm);
                    } else {
                        req.session.state = 2;
                        next();
                    }
                }
            } else {
                if (loginNeeded) {
                    rm.setResult(AuthService.getAuthorizeCode(req.query.redirect_uri));
                    rm.authMsg();
                    res.send(rm);
                } else {
                    req.session.state = 0;
                    next();
                }
            }
        }
    } catch (err) {
        console.error('C端授权失败：');
        console.error(err);
        rm.errorMsg();
        res.status(rm.code).send(rm);
    }
};

async function initUser(userinfo, updateNeeded = true) {
    try {
        const query = {
            user_id: userinfo.userName,
            status: Constant.STATUS_NORMAL
        };
        const user = await UserService.findOne(query);
        const entity = {
            name: userinfo.name,
            id_number: userinfo.idcard,
            mobile: userinfo.mobile,
            nickname: userinfo.nickName,
            head_url: userinfo.head_pic
        };
        if (!user || !user.id_number || updateNeeded) {
            await UserService.upsert(query, entity);
            const remoteRes = await AgentService.request(config.app.domain + config.app.profile.url, config.app.profile.method, {username: userinfo.userName});
            if (remoteRes.code === 1) {
                const profile = JSON.parse(encryptor.decryptByDES(remoteRes.result, config.keys.des));
                if (profile && profile.sex) {
                    UserService.updateOne(query, {
                        sex: profile.sex,
                        nation: profile.nation,
                        birth: profile.birth,
                        address: profile.address
                    });
                }
            }
            console.log('初始化用户成功');
        }
    } catch (err) {
        console.error('初始化用户失败：');
        console.error(err);
    }
}
