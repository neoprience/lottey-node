/**
 * Created by LQ on 2019/11/15
 */
const mongoose = require('../../../db/mongo');

const schema = mongoose.Schema({
    node: [String], // 节点
    input: String, // 文本
    select: Number, // 单选
    check: Boolean, // 勾选
    status: { // 状态，1-有效，0-已删除
        type: Number,
        default: 1
    }
}, {
    'versionKey': false,
    'timestamps': {
        createdAt: 'create_time',
        updatedAt: 'update_time'
    }
});

const model = mongoose.model('example', schema, 'example');

module.exports = model;

