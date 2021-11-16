/**
 * Created by LQ on 2019/11/15
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');
const router = express.Router({mergeParams: true});
const nodeExcel = require('excel-export');
const moment = require('moment');

const RestMsg = require('../../../common/restmsg');
const Constant = require('../../../common/constant');
const validator = require('../../../common/validator');
const tools = require('../../../common/tools');

const ExampleService = require('../../../service/example/exampleservice');
const Example = require('../../../service/example/model/examplebo');

router.route('/')

    /**
     * @api {get} /api/examples 分页查询
     * @apiGroup example
     *
     * @apiParam {Number} page 页码
     * @apiParam {Number} [limit=10] 每页条数
     * @apiParam {String} [input] 文本
     *
     * @apiSuccess (返回) {String} _id ID
     * @apiSuccess (返回) {String} input 文本
     *
     * @apiVersion 1.0.0
     */
    .get(async (req, res) => {
        const rm = new RestMsg();

        // 组装查询条件
        const pageNum = req.query.page ? req.query.page : 1;
        const pageSize = req.query.limit ? req.query.limit : 10;
        req.query = {status: Constant.STATUS_NORMAL};
        if (req.query.input) {
            req.query.input = new RegExp(req.query.input, 'i');
            delete req.query.input;
        }

        try {
            const page = await ExampleService.findByPage(pageNum, pageSize, req.query, '_id input', {create_time: -1});
            rm.setResult(page);
            rm.successMsg();
            res.send(rm);
        } catch (err) {
            console.error('请求示例列表失败：');
            console.error(err);
            rm.errorMsg('请求示例列表失败');
            res.status(rm.code).send(rm);
        }
    });

router.route('/:id')

    /**
     * @api {get} /api/examples/:id 详情
     * @apiGroup example
     *
     * @apiSuccess (返回) {[String]} node 节点
     * @apiSuccess (返回) {String} input 文本
     * @apiSuccess (返回) {Number} select 单选
     * @apiSuccess (返回) {Boolean} check 勾选项
     * @apiSuccess (返回) {Date} create_time 创建时间
     *
     * @apiVersion 1.0.0
     */
    .get(async (req, res) => {
        const rm = new RestMsg();
        const id = req.params.id;
        try {
            const example = await ExampleService.findOne({_id: id, status: Constant.STATUS_NORMAL}, '-update_time -status');
            if (example) {
                rm.setResult(example);
                rm.successMsg();
                res.send(rm);
            } else {
                rm.notFoundMsg();
                res.status(rm.code).send(rm);
            }
        } catch (err) {
            console.error('获取记录' + id + '详情失败：');
            console.error(err);
            rm.errorMsg();
            res.status(rm.code).send(rm);
        }
    });

module.exports = router;
