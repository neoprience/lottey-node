/**
 * 关键词提取工具
 */
const nodejieba = require('nodejieba');

module.exports = {
    extractKeywords: (text, topN = 2) => {
        const result = nodejieba.extract(text, topN);
        topN = (result.length < topN) ? result.length : topN;
        const keywords = (result.length === 1) ? [] : [text];
        for (let i = 0; i < topN; i++) {
            keywords.push(result[i].word);
        }
        return keywords;
    }
};
