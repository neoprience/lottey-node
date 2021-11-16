/**
 * 加解密工具
 */
const crypto = require('crypto');
const config = require('../config');

module.exports = {

    /**
     * 生成指定长度随机码
     * @param min
     * @param max
     * @returns {string}
     */
    generateRandomCode: (min = 16, max = 16) => {
        const charset = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        const range = Math.round(Math.random() * (max - min)) + min;
        let randomCode = '';
        for (let i = 0; i < range; i++) {
            randomCode += charset[Math.round(Math.random() * (charset.length - 1))];
        }
        return randomCode;
    },

    /**
     * 获取 AES keys
     * @returns {Promise.<*>}
     */
    getAESKey: async () => {
        if (config.env === 'development') {
            return {
                public_key: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCD9H+fRcxHvE0MAAPa1WmUVDxz3t6smsLr7MQc5oVIzWP77avHfQP+5TJQNw9G9Zcz7+xdMXIDLuyN6rmCzp5KkfM0fn30kj6RSpRxo6bewOUcCaMt6axBNbzr1tyAQohYN9nzQSyvC0D55579gJDNGqKe8p+OtISBveagNGNAvwIDAQAB',
                private_key: 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIP0f59FzEe8TQwAA9rVaZRUPHPe3qyawuvsxBzmhUjNY/vtq8d9A/7lMlA3D0b1lzPv7F0xcgMu7I3quYLOnkqR8zR+ffSSPpFKlHGjpt7A5RwJoy3prEE1vOvW3IBCiFg32fNBLK8LQPnnnv2AkM0aop7yn460hIG95qA0Y0C/AgMBAAECgYA8KF1+iV2mXqxpiiA3xg/KNdURpkuyOSQgVuLZoialmC27DxG/crk9ndQgSdnHKfPzE7CYlBA8b0odMSO+BOCYyrxwTV96GH03ym3uGkLnb9pmzgM5N9ANW7kTPGFcDlnmiG+YI6DEqz3ZTNj5BS8H/J55jkGGr+6mYzGQbordIQJBAMGxK3BdApFAZZeqwsevIMqPATqeUwFCh0s5UopLEC2cjvojO1HHVIQUs5i1MWd6UkYlLkp4Fs6zyicJKKmQ0EcCQQCuZzH6eaXMfjGqVHSCIV5rq5wHxjpziDxtsGtYFCIP+BC2w4x3hPNVMus9XQGP5Mqese1edWV7FCD6r04Jf//JAkEAr0zcFbv4QOHZkKT52KQFt44p/JWiZjeCH3Dn5UX+hGl3dahBXchcE5Zw3TrQVej9YYLxHHEHo1hRE3dUl/L6rQJAZlWJHvb4UXiOvepWfvEDjVwh7vHi5F3BT3+gTQtrPUGK1SMDLjJl8c0x+Uy0mPFf7yRqKu3pwQF7pHzu5mYj+QJAXvi1OWU2EA/3AXFArFsFq8NjE3t4cYB/LF7BQloKWvgAE1Y1snf+tvUvmnGEQfyfOSwk7gVSHh3T5JDeoZSM5g==',
                expire_time: '1566219204271'
            };
        } else {
            const redisClient = require('../db/rsaredis');
            const RedisOperator = require('../service/common/redisservice');
            const RedisService = RedisOperator.generate(redisClient);
            return await RedisService.getHash('RSA_KEY:rsa_key');
        }
    },

    /**
     * 私钥解密
     * @param cipherText
     * @param key
     * @returns {Buffer}
     */
    decryptByPrivate: (cipherText, key) => {
        return crypto.privateDecrypt({key, padding: crypto.constants.RSA_PKCS1_PADDING}, Buffer.from(cipherText, 'base64')).toString('utf8');
    },

    /**
     * 公钥加密
     * @param plainText
     * @param key
     * @returns {string}
     */
    encryptByPublic: (plainText, key) => {
        key = '-----BEGIN PUBLIC KEY-----\n' + key + '\n-----END PUBLIC KEY-----';
        return crypto.publicEncrypt({key, padding: crypto.constants.RSA_PKCS1_PADDING}, Buffer.from(plainText, 'utf8')).toString('base64');
    },

    /**
     * AES加密
     * @param plainText
     * @param key
     * @param iv
     * @param algorithm
     * @returns {Buffer | string}
     */
    encryptByAES: (plainText, key, iv = 'E08ADE2699714B87', algorithm = 'aes-128-cbc') => {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let cipherText = cipher.update(plainText, 'utf8', 'hex');
        cipherText += cipher.final('hex');
        return cipherText;
    },

    /**
     * AES解密
     * @param cipherText
     * @param key
     * @param iv
     * @param algorithm
     * @returns {Buffer | string}
     */
    decryptByAES: (cipherText, key, iv = 'E08ADE2699714B87', algorithm = 'aes-128-cbc') => {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let plainText = decipher.update(cipherText, 'hex', 'utf8');
        plainText += decipher.final('utf8');
        return plainText;
    },

    /**
     * des加密
     * @param key
     * @param plainText
     * @param iv
     * @param algorithm
     * @returns {Buffer | string}
     */
    encrypt: (key, plainText, iv = 0, algorithm = 'des-ecb') => {
        const cipher = crypto.createCipheriv(algorithm, new Buffer(key), new Buffer(iv));
        let cipherText = cipher.update(plainText, 'utf8', 'hex');
        cipherText += cipher.final('hex');
        return cipherText;
    },

    /**
     * DES解密
     * @param cipherText
     * @param key
     * @param iv
     * @param algorithm
     * @returns {Buffer | string}
     */
    decryptByDES: (cipherText, key, iv = 0, algorithm = 'des-ecb') => {
        const decipher = crypto.createDecipheriv(algorithm, new Buffer(key), new Buffer(iv));
        decipher.setAutoPadding(true);
        let plainText = decipher.update(cipherText, 'hex', 'utf8');
        plainText += decipher.final('utf8');
        return plainText;
    },

    /**
     * des-ede加密
     * @param key
     * @param plainText
     * @returns {Buffer | string}
     */
    encode: (key, plainText) => {
        const cipher = crypto.createCipher('des-ede', key);
        let cipherText = cipher.update(plainText, 'utf8', 'base64');
        cipherText += cipher.final('base64');
        return cipherText;
    },

    /**
     * des-ede解密
     * @param key
     * @param cipherText
     * @returns {Buffer | string}
     */
    decode: (key, cipherText) => {
        const decipher = crypto.createDecipher('des-ede', key);
        let plainText = decipher.update(cipherText, 'base64', 'utf8');
        plainText += decipher.final('utf8');
        return plainText;
    },

    /**
     * md5加密
     * @param text
     * @param salt
     * @returns {Buffer | string}
     */
    md5Hash: (text, salt) => {
        if (salt) {
            return crypto.createHmac('md5', salt.toString('hex')).update(text + '').digest('hex');
        } else {
            return crypto.createHash('md5').update(text + '').digest('hex');
        }
    },

    /**
     * sha1算法加密
     * @param text
     * @param salt
     * @returns {Buffer | string}
     */
    sha1Hash: (text, salt = new Date().getTime()) => {
        return crypto.createHmac('sha1', salt + '').update(text + '').digest('hex');
    }
};
