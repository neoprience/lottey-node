const validator = require('../../common/validator');
const encryptor = require('../../common/encryptor');
const RestMsg = require('../../common/restmsg');

module.exports = async (req, res, next) => {
    const rm = new RestMsg();
    const params = req.method.toLowerCase() === 'get' ? req.query : req.body;
    const paramsValidation = validator.validateParams(params, {
        key: {
            name: '密钥',
            rule: 'required'
        },
        expire_time: {
            name: '公钥过期时间',
            rule: 'required'
        }
    });
    if (paramsValidation.fails) {
        rm.badRequestMsg('非法请求');
        res.status(rm.code).send(rm);
    } else {
        try {
            const privateObj = await encryptor.getAESKey();
            if (privateObj && privateObj.private_key && privateObj.public_key && privateObj.expire_time === params.expire_time) {
                const privateKey = '-----BEGIN PRIVATE KEY-----\n' + privateObj.private_key + '\n-----END PRIVATE KEY-----';
                const aesKey = encryptor.decryptByPrivate(params.key, privateKey);
                params.key = aesKey;
                if (params.data) {
                    params.data = JSON.parse(encryptor.decryptByAES(params.data, aesKey));
                }
                next();
            } else {
                rm.badRequestMsg('密钥已过期，请重新获取');
                res.status(rm.code).send(rm);
            }
        } catch (err) {
            console.error('解密失败：');
            console.error(err);
            rm.errorMsg();
            res.state(rm.code).send(rm);
        }
    }
};
