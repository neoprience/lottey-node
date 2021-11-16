/**
 * Created by LQ on 2019/7/12
 */
const express = require('express');
const router = express.Router({mergeParams: true});
const RestMsg = require('../../../common/restmsg');
const Constant = require('../../../common/constant');
const auth = require('../auth');
const UserService = require('../../../service/user/userservice');

router.route('/auth')
    .all((req, res, next) => {
        auth(req, res, next);
    })

    /**
     * @api {post} /api/users/login 鉴权
     * @apiGroup app/users
     *
     * @apiSuccess (返回) {Number} result 0-未登录，2-未实名，3-已实名
     *
     * @apiVersion 1.0.0
     */
    .get((req, res) => {
        const rm = new RestMsg();
        rm.setResult(req.session.state);
        rm.successMsg();
        res.send(rm);
    });

module.exports = router;
