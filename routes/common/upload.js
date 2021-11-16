const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const FileSDK = require('../../service/upload/uploadFsService');
const RestMsg = require('../../common/restmsg');
const config = require('../../config');


/**
 * 设置multer模块上传文件的路径destination、上传后的文件名filename
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, '../../public'))) {
            fs.mkdirSync(path.join(__dirname, '../../public'));
        }
        if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../../public/uploads'));
        }
        cb(null, path.join(__dirname, '../../public/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/:type', upload.any(), async (req, res) => {
    const rm = new RestMsg();
    const type = req.params.type;
    const files = req.files;
    const file = files[0];
    let illegal = false;
    let oversize = false;
    switch (type) {
        case 'image':
            (file.mimetype.indexOf('image') === -1) && (illegal = true);
            (file.size > config.servers.upload.maxSize.image) && (oversize = true);
            break;
        case 'audio':
            (file.mimetype.indexOf('audio') === -1) && (illegal = true);
            (file.size > config.servers.upload.maxSize.audio) && (oversize = true);
            break;
        case 'video':
            (file.mimetype.indexOf('video') === -1) && (illegal = true);
            (file.size > config.servers.upload.maxSize.video) && (oversize = true);
            break;
        default:
            rm.badRequestMsg('非法请求');
            res.status(rm.code).send(rm);
            return;
    }
    if (illegal) {
        rm.badRequestMsg('文件类型非法');
        res.status(rm.code).send(rm);
        return;
    }
    if (oversize) {
        rm.badRequestMsg('文件大小超过限制');
        res.status(rm.code).send(rm);
        return;
    }
    const FileSDKs = new FileSDK(); // 实例化SDK
    const up = await FileSDKs.putFile(file.path, 'ceshi-p'); // 调用upload方法，第一个参数为要上传的文件的路径，第二个参数为文件上传到服务器上的空间名bucket
    res.send(up);
});

module.exports = router;
