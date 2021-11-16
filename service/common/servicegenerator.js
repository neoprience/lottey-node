/**
 * service生成器
 */
const encryptor = require('../../common/encryptor');
const Page = require('../../common/page');
const config = require('../../config');

function ServiceGenerator() {

}

ServiceGenerator.generate = (Model, encoded = '', key = '_id') => { // 构建service

    function handleEncoded(data, encrypt = false) {
        const func = encrypt ? 'encryptByAES' : 'decryptByAES';
        const props = encoded.split(' ');
        if (data.length) {
            return data.map((item, index, array) => {
                for (const prop in item) {
                    if (props.indexOf(prop) > -1) {
                        item[prop] = encryptor[func](item[prop], config.keys.aes);
                    }
                }
                return item;
            })
        } else {
            const temp = {};
            for (const prop in data) {
                if (props.indexOf(prop) > -1) {
                    temp[prop] = encryptor[func](data[prop], config.keys.aes);
                }
            }
            return temp;
        }
    }

    const service = {};

    /**
     * 新增单条记录
     *
     * @param obj
     */
    service.create = async obj => {
        if (encoded) {
            obj = handleEncoded(obj, true);
        }
        return (await new Model(obj).save());
    };

    /**
     * 删除符合条件的所有记录
     *
     * @param query
     */
    service.remove = async query => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        return (await Model.remove(query));
    };

    /**
     * 更新
     *
     * @param query
     * @param updateObj
     */
    service.update = async (query, updateObj) => {
        if (encoded) {
            query = handleEncoded(query, true);
            updateObj = handleEncoded(updateObj, true);
        }
        return (await Model.updateOne(query, updateObj));
    };

    /**
     * 更新单条记录
     *
     * @param query
     * @param updateObj
     */
    service.updateOne = async (query, updateObj) => {
        if (encoded) {
            query = handleEncoded(query, true);
            updateObj = handleEncoded(updateObj, true);
        }
        return (await Model.updateOne(query, {$set: updateObj}));
    };

    /**
     * 更新符合条件的所有记录
     *
     * @param query
     * @param updateObj
     */
    service.updateMany = async (query, updateObj) => {
        if (encoded) {
            query = handleEncoded(query, true);
            updateObj = handleEncoded(updateObj, true);
        }
        return (await Model.updateMany(query, {$set: updateObj}));
    };

    /**
     * 更新符合条件的所有记录，若无记录则新增
     * @param query
     * @param updateObj
     * @param multi
     * @returns {Promise.<*>}
     */
    service.upsert = async (query, updateObj, multi) => {
        if (encoded) {
            query = handleEncoded(query, true);
            updateObj = handleEncoded(updateObj, true);
        }
        if (multi) {
            return (await Model.updateMany(query, updateObj, {multi: true, upsert: true}));
        } else {
            return (await Model.updateOne(query, updateObj, {upsert: true}));
        }
    };

    /**
     * list查询
     *
     * @param query
     * @param props
     * @param sort
     */
    service.findByList = async (query = {}, props = {}, sort = {}) => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        let data = await Model.find(query, props, {sort: sort});
        if (encoded) {
            data = handleEncoded(data);
        }
        return data;
    };

    /**
     * 查询指定数目记录
     * @param query
     * @param props
     * @param limit
     * @param sort
     * @returns {Promise.<*>}
     */
    service.findSome = async (query = {}, props = {}, limit = 10, sort = {}) => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        let data = await Model.find(query, props, {limit: limit, sort: sort});
        if (encoded) {
            data = handleEncoded(data);
        }
        return data;
    };

    /**
     * 分页查询
     *
     * @param pageNum
     * @param pageSize
     * @param query
     * @param props
     * @param sort
     */
    service.findByPage = async (pageNum = 1, pageSize = 10, query = {}, props = {}, sort = {}) => {
        try {
            pageNum = parseInt(pageNum);
        } catch (e) {
            pageNum = 1;
        }
        try {
            pageSize = parseInt(pageSize);
        } catch (e) {
            pageSize = 10;
        }

        const page = new Page();
        if (encoded) {
            query = handleEncoded(query, true);
        }
        const total = await Model.count(query); // TODO 高版本count报警，但countDocuments是聚合查询
        if (total) {
            let data = await Model.find(query, props, {limit: pageSize, skip: pageSize * (pageNum - 1), sort: sort});
            if (encoded) {
                data = handleEncoded(data);
            }
            page.setPageAttr(total, pageNum, pageSize);
            page.setData(data);
        }
        return page;
    };

    /**
     * 根据ID查询单条记录
     *
     * @param id
     * @param props
     */
    service.findById = async (id, props = {}) => {
        let query = {};
        query[key] = id;
        if (encoded) {
            query = handleEncoded(query, true);
        }
        let data = await Model.findOne(query, props);
        if (data && encoded) {
            data = handleEncoded(data);
        }
        return data;
    };

    /**
     * 查询单条记录
     *
     * @param query
     * @param props
     */
    service.findOne = async (query, props = {}) => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        let data = await Model.findOne(query, props);
        if (data && encoded) {
            data = handleEncoded(data);
        }
        return data;
    };

    /**
     * 查询符合条件的记录是否存在
     *
     * @param query
     */
    service.exist = async query => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        return (!!await Model.count(query)); // TODO 高版本count报警，但countDocuments是聚合查询
    };

    /**
     * 查询符合条件的记录数
     *
     * @param query
     */
    service.count = async query => {
        if (encoded) {
            query = handleEncoded(query, true);
        }
        return (await Model.count(query)); // TODO 高版本count报警，但countDocuments是聚合查询
    };

    return service;
};

module.exports = ServiceGenerator;
