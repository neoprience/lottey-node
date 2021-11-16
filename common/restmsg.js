/**
 * 标准返回
 * @constructor
 */
function RestMsg() {
    this.code = 100;
    this.msg = 'continue';
}

RestMsg.prototype._RECODE_SUCCESS = 200; // 请求成功
RestMsg.prototype._RECODE_FAILED = 700; // 请求异常
RestMsg.prototype._RECODE_NOT_AUTHORIZED = 601; // 未授权
RestMsg.prototype._RECODE_NOT_FOUND = 604; // 找不到资源
RestMsg.prototype._RECODE_BAD_REQUEST = 600; // 客户端请求错误

/**
 * 填充返回数据
 * @param data
 */
RestMsg.prototype.setResult = function (data) {
    this.result = data;
};

/**
 * 设置成功返回
 * @param msg
 */
RestMsg.prototype.successMsg = function (msg = 'success') {
    this.code = this._RECODE_SUCCESS;
    this.msg = msg;
    return this;
};

/**
 * 设置异常返回
 * @param msg
 */
RestMsg.prototype.errorMsg = function (msg = 'failed') {
    this.code = this._RECODE_FAILED;
    this.msg = msg;
    return this;
};

/**
 * 设置未授权返回
 * @param msg
 */
RestMsg.prototype.authMsg = function (msg = 'not authorized') {
    this.code = this._RECODE_NOT_AUTHORIZED;
    this.msg = msg;
    return this;
};

/**
 * 设置404返回
 * @param msg
 */
RestMsg.prototype.notFoundMsg = function (msg = 'not found') {
    this.code = this._RECODE_NOT_FOUND;
    this.msg = msg;
    return this;
};

/**
 * 设置客户端请求错误返回
 * @param msg
 */
RestMsg.prototype.badRequestMsg = function (msg = 'bad request') {
    this.code = this._RECODE_BAD_REQUEST;
    this.msg = msg;
    return this;
};

module.exports = RestMsg;
