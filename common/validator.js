/**
 * 参数校验工具
 */
const mongoose = require('mongoose');
const Validator = require('validatorjs');
Validator.useLang('zh');

module.exports = {

    /**
     * 参数校验
     *
     * @param {object} params {paramKey: paramValue, ...}格式
     * @param {object} paramProps {paramKey: {name: paramName, rule: [rule1, rule2, ...]}, ...}格式，规则写法参见https://www.npmjs.com/package/validatorjs的"Available Rules"章节
     * @returns {{passes: (*|boolean|undefined), fails: (*|boolean|undefined)}}
     */
    validateParams: (params, paramProps) => {
        const rules = {};
        const customNames = {};
        for (const param in paramProps) {
            rules[param] = paramProps[param].rule;
            customNames[param] = paramProps[param].name ? paramProps[param].name : param;
        }
        const validator = new Validator(params, rules);
        validator.setAttributeNames(customNames);

        const returnObj = {
            passes: validator.passes(),
            fails: validator.fails()
        };
        if (validator.fails()) {
            const msg = [];
            for (const param in validator.errors.all()) {
                msg.push(validator.errors.first(param));
            }
            returnObj.msg = msg.join('');
        }
        return returnObj;
    },

    /**
     * ID/ID数组校验
     *
     * @param {string/array} value
     * @param value
     * @returns {*}
     */
    validateId: value => {
        const passesReturn = {
            passes: true,
            fails: false
        };
        const failsReturn = {
            passes: false,
            fails: true,
            msg: '非法请求'
        };
        if (typeof value === 'string') {
            if (mongoose.Types.ObjectId.isValid(value)) {
                return passesReturn;
            } else {
                return failsReturn;
            }
        } else if (value instanceof Array) {
            for (let i = 0; i < value.length; i++) {
                if (!mongoose.Types.ObjectId.isValid(value[i])) {
                    return failsReturn;
                }
            }
            return passesReturn;
        } else {
            return failsReturn;
        }
    }
};
