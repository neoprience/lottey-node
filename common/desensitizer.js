module.exports = {

    /**
     * 通用脱敏方法
     * @param str
     * @param frontLen
     * @param endLen
     * @returns {*}
     */
    desensitize: (str, frontLen, endLen) => {
        if (str && str.length) {
            const len = str.length - frontLen - endLen;
            let substitute = '';
            for (let i = 0; i < len; i++) {
                substitute += '*';
            }
            return str.substring(0, frontLen) + substitute + str.substring(str.length - endLen);
        } else {
            return str;
        }
    },

    /**
     * 根据内容类型脱敏
     * @param str
     * @param type
     * @returns {*}
     */
    desensitizeByType: (str, type = 'ID') => {
        switch (type) {
            case 'ID':
                if (str.length === 18) {
                    return str.substring(0, 6) + '********' + str.substring(14);
                } else {
                    throw new Error('脱敏失败：身份证号非法');
                }
                break;
            case 'name':
                if (str.length) {
                    let substitute = '';
                    for (let i = 0; i < str.length - 1; i++) {
                        substitute += '*';
                    }
                    return str.substring(0, 1) + substitute;
                } else {
                    throw new Error('脱敏失败：姓名为空');
                }
                break;
            case 'mobile':
                if (str.length === 11) {
                    return str.substring(0, 4) + '****' + str.substring(7);
                } else {
                    throw new Error('脱敏失败：手机号非法');
                }
                break;
            default:
                return str;
        }
    }
};
