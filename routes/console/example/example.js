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

/**
 * @api {post} /console/api/examples/import 从excel文件导入数据
 * @apiGroup [console]example
 *
 * @apiVersion 1.0.0
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, '../../../public'))) {
            fs.mkdirSync(path.join(__dirname, '../../../public'));
        }
        cb(null, path.join(__dirname, '../../../public'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage});
router.post('/import', upload.any(), async (req, res) => {
    const rm = new RestMsg();
    const files = req.files;
    const file = files[0];
    if (['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].indexOf(file.mimetype) === -1) {
        rm.badRequestMsg('文件类型非法');
        res.status(rm.code).send(rm);
    } else {
        try {
            await tools.importData(file.filename, ['node|array', 'input', 'select', 'check'], Example, {status: Constant.STATUS_NORMAL});
            rm.successMsg();
            res.send(rm);
        } catch (err) {
            rm.errorMsg(err);
            res.status(rm.code).send(rm);
        }
        fs.unlink(path.join(__dirname, '../../../public/') + file.filename, err => {
            if (err) {
                console.error('删除暂存文件失败：');
                console.error(err);
            }
        })
    }
});

/**
 * @api {get} /console/api/examples/export 导出数据至excel
 * @apiGroup [console]example
 *
 * @apiVersion 1.0.0
 */
router.get('/export', async (req, res) => {
    const rm = new RestMsg();
    req.query = {status: Constant.STATUS_NORMAL};
    if (req.query.create_time) {
        delete req.query.create_time;
    }

    try {
        const data = await ExampleService.findByList(req.query, '-status -update_time', {create_time: -1});
        const rows = data.map(item => {
            const row = [];
            row.push(item.node);
            row.push(item.input);
            row.push(item.select);
            row.push(item.create_time);
            row.push(item.check);
            return row;
        });
        const conf = {
            cols: [
                {
                    caption: '节点',
                    type: 'string',
                    beforeCellWrite: (row, cellData) => {
                        return cellData.join(',');
                    }
                }, {
                    caption: '文本',
                    type: 'string'
                }, {
                    caption: '单选',
                    type: 'number'
                }, {
                    caption: '创建时间',
                    type: 'string',
                    beforeCellWrite: (row, cellData) => {
                        return moment(cellData).format('YYYY-MM-DD HH:mm:ss');
                    }
                }, {
                    caption: '勾选',
                    type: 'bool'
                }
            ],
            rows: rows
        };
        const result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'example.xlsx');
        res.end(result, 'binary');
    } catch (err) {
        console.error('导出示例列表失败：');
        console.error(err);
        rm.errorMsg('导出示例列表失败');
        res.status(rm.code).send(rm);
    }
});

router.route('/')

    /**
     * @api {get} /console/api/examples 分页查询
     * @apiGroup [console]example
     *
     * @apiParam {Number} page 页码
     * @apiParam {Number} [limit=10] 每页条数
     * @apiParam {[String]} [node] 节点
     * @apiParam {String} [input] 文本
     * @apiParam {Number} [select] 单选
     * @apiParam {Boolean} [check] 勾选项
     * @apiParam {[String]} [create_time] 创建时间范围
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

        // 组装查询条件
        const pageNum = req.query.page ? req.query.page : 1;
        const pageSize = req.query.limit ? req.query.limit : 10;
        req.query = {status: Constant.STATUS_NORMAL};
        if (req.query.create_time) {
            delete req.query.create_time;
        }

        try {
            const page = await ExampleService.findByPage(pageNum, pageSize, req.query, 'node input select create_time check', {create_time: -1});
            rm.setResult(page);
            rm.successMsg();
            res.send(rm);
        } catch (err) {
            console.error('请求示例列表失败：');
            console.error(err);
            rm.errorMsg('请求示例列表失败');
            res.status(rm.code).send(rm);
        }
    })

    /**
     * @api {post} /console/api/examples 新增
     * @apiGroup [console]example
     *
     * @apiParam {String} name 姓名
     * @apiParam {String} mobile 手机
     * @apiParam {String} [email] 邮箱
     * @apiParam {Object} [profile] 个人信息，{sex: 性别, birth: 生日, address: 住址}
     *
     * @apiVersion 1.0.0
     */
    .post(async (req, res) => {
        const rm = new RestMsg();

        const paramsValidation = validator.validateParams(req.body, {
            input: {
                name: '文本',
                rule: 'required|string'
            },
            select: {
                name: '选择器',
                rule: 'in:1,2,3,4,5'
            }
        });
        if (paramsValidation.fails) {
            rm.badRequestMsg(paramsValidation.msg);
            res.status(rm.code).send(rm);
        } else {
            try {
                await ExampleService.create(req.body);
                rm.successMsg();
                res.send(rm);
            } catch (err) {
                console.error('新增记录失败：');
                console.error(err);
                rm.errorMsg();
                res.status(rm.code).send(rm);
            }
        }
    });

router.route('/:id')

    /**
     * @api {get} /console/api/examples/:id 详情
     * @apiGroup [console]example
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
    })

    /**
     * @api {put} /console/api/examples/:id 更新
     * @apiGroup [console]example
     *
     * @apiParam {String} name 姓名
     * @apiParam {String} mobile 手机
     * @apiParam {String} [email] 邮箱
     * @apiParam {Object} [profile] 个人信息，{sex: 性别, birth: 生日, address: 住址}
     *
     * @apiVersion 1.0.0
     */
    .put(async (req, res) => {
        const rm = new RestMsg();
        const id = req.params.id;
        const paramsValidation = validator.validateParams(req.body, {
            input: {
                name: '文本',
                rule: 'required|string'
            },
            select: {
                name: '选择器',
                rule: 'in:1,2,3,4,5'
            }
        });
        if (paramsValidation.fails) {
            rm.badRequestMsg(paramsValidation.msg);
            res.status(rm.code).send(rm);
        } else {
            try {
                await ExampleService.updateOne({_id: id}, req.body);
                rm.successMsg();
                res.send(rm);
            } catch (err) {
                console.error('更新记录' + id + '失败：');
                console.error(err);
                rm.errorMsg();
                res.status(rm.code).send(rm);
            }
        }
    })

    /**
     * @api {delete} /console/api/examples/:id 删除
     * @apiGroup [console]example
     *
     * @apiVersion 1.0.0
     */
    .delete(async (req, res) => {
        const rm = new RestMsg();
        const id = req.params.id;
        try {
            await ExampleService.updateOne({_id: id}, {status: Constant.STATUS_DELETED});
            rm.successMsg();
            res.send(rm);
        } catch (err) {
            console.log('删除记录' + id + '失败：');
            console.error(err);
            rm.errorMsg();
            res.status(rm.code).send(rm);
        }
    });

module.exports = router;
