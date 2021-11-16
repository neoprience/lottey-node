/**
 * 随机数生成工具
 */
module.exports = {

    /**
     * 生成随机字符串
     * @param minLen
     * @param maxLen
     * @param characters
     * @returns {string}
     */
    generate: (minLen = 62, maxLen = 62, characters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']) => {
        let random = '';
        const randomLen = Math.round(Math.random() * (maxLen - minLen)) + minLen;
        for (let i = 0; i < randomLen; i++) {
            random += characters[Math.round(Math.random() * (characters.length - 1))];
        }
        return random;
    }
};
