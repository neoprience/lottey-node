/**
 * Created by LQ on 2019/7/12
 */
const express = require('express');
const router = express.Router({mergeParams: true});

const RestMsg = require('../../../common/restmsg');
const Constant = require('../../../common/constant');
const validator = require('../../../common/validator');
const encryptor = require('../../../common/encryptor');

const decipher = require('../../common/decipher');
const UserService = require('../../../service/user/userservice');

router.use(decipher);

router.route('/')

/**
 * @api {post} /console/api/users 分页查询
 * @apiGroup [console]user
 *
 * @apiParam {Number} page 页码
 * @apiParam {Number} [limit=10] 每页条数
 * @apiParam {String} key 加密后AES密钥
 * @apiParam {String} expire_time RSA密钥过期时间
 * @apiParam {String} data 加密后参数，{name: 姓名, id_number: 身份证号, mobile: 手机号, user_id: 用户名}
 *
 * @apiSuccess (返回) {String} name 姓名
 * @apiSuccess (返回) {String} id_number 身份证号
 * @apiSuccess (返回) {String} mobile 手机
 * @apiSuccess (返回) {String} user_id 用户名
 * @apiSuccess (返回) {String} nickname 昵称
 * @apiSuccess (返回) {String} head_url 头像地址
 * @apiSuccess (返回) {Object} profile 个人信息，{sex: 性别, nation: 民族, birth: 生日, address: 住址}
 * @apiSuccess (返回) {Date} create_time 创建时间
 *
 * @apiVersion 1.0.0
 */
    .post(async (req, res) => {
        const rm = new RestMsg();

        // 组装查询条件
        let query = {};
        req.body.data && (query = req.body.data);
        const pageNum = req.body.page ? req.body.page : 1;
        const pageSize = req.body.limit ? req.body.limit : 10;
        query.status = Constant.STATUS_NORMAL;

        try {
            const page = await UserService.findByPage(pageNum, pageSize, query, '-head_url -id_type -status -update_time', {create_time: -1});
            const props = ['name', 'id_number', 'mobile', 'user_id'];
            page.data = page.data.map((item, index, array) => {
                for (const prop in item) {
                    if (props.indexOf(prop) > -1) {
                        item[prop] = encryptor.encryptByAES(item[prop], req.body.key);
                    }
                }
                return item;
            });
            rm.setResult(page);
            rm.successMsg();
            res.send(rm);
        } catch (err) {
            console.error('请求用户列表失败：');
            console.error(err);
            rm.errorMsg('请求用户列表失败');
            res.status(rm.code).send(rm);
        }
    });

module.exports = router;
