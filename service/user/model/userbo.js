/**
 * Created by LQ on 2019/7/12
 */
const mongoose = require('../../../db/mongo');

const schema = mongoose.Schema({
    name: String, // 姓名(加密入库)
    id_type: {
        type: String,
        default: 'ID'
    }, // 证件类型（ID-身份证）
    id_number: String, // 证件号(加密入库)
    mobile: String, // 手机（加密入库）
    user_id: String, // 关联渠道用户唯一标记(加密入库)
    nickname: String, // 昵称
    head_url: String, // 头像地址
    profile: Object, // 个人信息
    status: {
        type: Number,
        default: 1
    } // 状态（1-正常、0-已删除）
}, {
    'versionKey': false,
    'timestamps': {
        createdAt: 'create_time',
        updatedAt: 'update_time'
    }
});

const model = mongoose.model('user', schema, 'user');

module.exports = model;

