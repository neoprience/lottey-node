'use strict';

const fs = require("fs");
const path = require("path");
const apollo = require('node-apollo');
const appId = process.argv[2];
const url = process.argv[3];

// apollo配置中心配置
const apollo_config = {
  configServerUrl: url,
  appId: appId,
  clusterName: 'default',
  namespaceName: ['common-config.json', 'config.json'] // n1的配置会被n2配置覆盖
};

// 读取apollo配置中心，并创建config.js文件
apollo.remoteConfigServiceFromCache(apollo_config).then(result => {
  fs.writeFile(path.join(__dirname, './config.js'), `'use strict';\n\n module.exports = ${JSON.stringify(result, null, "\t")}`, function (err) {
    if (err)
      console.log('写入失败');
  })
})
  .catch(err => {
    console.error(err);
  }).done;
  
fs.writeFile(path.join(__dirname, './process.yml'),
  `apps:
- name : ${appId}
  script: "./bin/www"
  max_memory_restart: 1G
  log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  error_file: "/logs/${appId}-err.log"
  out_file: "/logs/${appId}-out.log"
  log_file: "/logs/${appId}-all.log"
  combine_logs: true
  env:
    NODE_ENV: development
  env_production:
    NODE_ENV: production`, function (err) {
  if (err)
    console.log('写入失败');
});
