const config = require('./uploadFsConfig');
const path = require('path');
const fs = require('fs');
const qiniu = require('qiniu');
const util = require('util');

var upLoadFs = function () {
    this.uploadFolder = path.join(__dirname, '../../public/uploads');
};

upLoadFs.prototype.putFile = async function(filepath,bucket){
    if (config.isRemote === false) { // 传文件到本地
        return await this.uploadToLocal(filepath);
    } else { // 传文件到服务器
        return await this.uploadToServer(filepath, bucket);
    }
};

const fsRename = util.promisify(fs.rename);

upLoadFs.prototype.uploadToLocal = async function (filepath) {
    const fileName = path.basename(filepath);
    const localUrl = config.localUrl + path.join(config.localContext, 'uploads', fileName);
    return {
        'code': 200,
        'msg': 'success',
        'result': {
            'url': localUrl,
            'name': fileName
        }
    };
};

upLoadFs.prototype.uploadToServer = async function (filepath, bucket) {
    const fileName = path.basename(filepath);
    const localFile = this.uploadFolder + '/' + fileName;
    const mac = new qiniu.auth.digest.Mac(config.accessKey, config.secretKey);
    const options = {
        scope: bucket
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    const qiniuConfig = new qiniu.conf.Config();
    qiniuConfig.zone = qiniu.zone.Zone_z0;
    qiniuConfig.useHttpsDomain = true;
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();
    const key = '';

    return new Promise((resolved, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            fs.unlinkSync(localFile);
            if (respErr) {
                reject(respErr);
            }
            if (respInfo.statusCode === 200) {
                resolved(respBody);
            } else {
                resolved(respBody);
            }
        })
    });
};

module.exports = upLoadFs;
