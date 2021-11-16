/**
 * 分页处理类
 * @constructor
 */
function Page() {
    this.total = 0;
    this.pagenum = 0;
    this.pagesize = 10;
    this.totalpages = 0;
    this.data = [];
}

/**
 * 填充分页数据
 *
 * @param data {Array}
 */
Page.prototype.setData = function (data) {
    this.data = data;
};

/**
 * 设置分页属性
 *
 * @param total {Number} 总条数
 * @param pageNum {Number} 当前页数
 * @param pageSize {Number} 每页条数
 */
Page.prototype.setPageAttr = function (total, pageNum, pageSize) {
    this.total = total;
    this.pagenum = pageNum;
    this.pagesize = pageSize;
    this.totalpages = Math.ceil(total / pageSize);
};

module.exports = Page;
