const moment = require('moment');
const xlsx = require('node-xlsx');

module.exports = {
    initTimeObj: reqTimestamp => { // 时间戳（秒）解析工具，不传入时默认解析当前时间
        let currTimestamp,
            currDate,
            currDateWithoutTimestamp = new Date();

        if (reqTimestamp && (reqTimestamp + '').length === 10 && isNumber(reqTimestamp)) {
            currTimestamp = (reqTimestamp > moment().unix()) ? moment().unix() : parseInt(reqTimestamp, 10);
            currDate = new Date(currTimestamp * 1000);
        } else {
            currTimestamp = moment().format();
            currDate = moment().format();
        }

        const tmpMoment = moment(currDate);

        return {
            now: tmpMoment,
            nowUTC: moment.utc(currDate),
            nowWithoutTimestamp: moment(currDateWithoutTimestamp),
            timestamp: currTimestamp,
            yearly: tmpMoment.format('YYYY'),
            monthly: tmpMoment.format('M'),
            daily: tmpMoment.format('D'),
            hourly: tmpMoment.format('YYYY.M.D.H'),
            weekly: Math.ceil(tmpMoment.format('DDD') / 7)
        };
    },

    /**
     * Excel数据导入工具
     *
     * @param doc 文档名称，含后缀
     * @param columns 集合属性名称组成的数组，与文档列一一对应
     * @param model 集合Model
     * @param initial 默认初始化的属性
     * @returns {Promise}
     */
    importData: (doc, columns, model, initial = {}) => {
        return new Promise((resolve, reject) => {
            if (doc && columns && columns.length && model) {
                try {
                    const data = xlsx.parse('./public/' + doc)[0].data; // 取第一个sheet的数据
                    data.shift(); // 删除标题行
                    if (data[0].length === columns.length) {
                        Promise.all(data.map(async item => {
                            const row = {};
                            for (let i = 0; i < columns.length; i++) {
                                const prop = columns[i].split('|');
                                if (prop.length > 1) {
                                    switch (prop[1]) {
                                        case 'array':
                                            row[prop[0]] = item[i].split(',');
                                            break;
                                    }
                                } else {
                                    row[columns[i]] = item[i];
                                }
                            }
                            await model.updateOne(row, initial, {upsert: true});
                        })).then(() => {
                            resolve();
                        }).catch(err => {
                            console.error('Excel文档 ' + doc + ' 数据导入失败：');
                            console.error(err);
                            reject('数据导入失败');
                        })
                    } else {
                        reject('文档结构有误');
                    }
                } catch (err) {
                    console.error('Excel文档 ' + doc + ' 数据导入失败：');
                    console.error(err);
                    reject('数据导入失败');
                }
            } else {
                reject('参数缺失');
            }
        })
    }
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}