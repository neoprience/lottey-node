
/**
 * 加解密工具
 */
const crypto = require('crypto');
const SecurityService = require('../../service/common/securityservice');

module.exports = {
    /**
     * RSA 私钥解密
     * @param str
     * @returns {Buffer|Object|string}
     */
    rsaPrivateDecrypt: (str) => {
        try {
            const result = crypto.privateDecrypt({
                key: SecurityService.rsaPrivateKey(),
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from(str, 'base64'));
            return result.toString('utf8');
        } catch (e) {
            console.error(e);
            console.error('私钥解密失败');
            return null;
        }
    },

    /**
     * RSA 公钥加密
     * @param str
     * @returns {*}
     */
    rsaPublicEncrypt: (str) => {
        try {
            const result = crypto.publicEncrypt({
                key: SecurityService.rsaPublicKey(),
                padding: crypto.constants.RSA_PKCS1_PADDING
            }, Buffer.from(str, 'utf8'));
            return result.toString('base64');
        } catch (e) {
            // console.error(e);
            console.error('公钥加密失败');
            return null;
        }
    }
};

