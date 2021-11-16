const express = require('express');
const session = require('express-session');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const RedisStore = require('connect-redis')(session); // 使用redis存储session时放开
// const redisClient = require('./db/redis'); // 使用redis存储session时放开

const api = require('./routes/app/api');
const auth_mgt = require('./routes/console/auth');
const api_mgt = require('./routes/console/api');
const RestMsg = require('./common/restmsg');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 使用redis存储session时放开
// app.use(session({
//     secret: 'dGZzbXk=',
//     name: 'BA31C2997F81913F',
//     saveUninitialized: false, // don't create session until something stored
//     resave: false, // don't save session if unmodified
//     unset: 'destroy', // the session will be destroyed (deleted) when the response ends.
//     rolling: true,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
//     store: new RedisStore({
//         client: redisClient,
//         ttl: 7 * 24 * 60 * 60, // = 7 days. Default
//         prefix: 'node-session'
//     })
// }));

// C端
app.use('/api', api);

// B端
app.use('/console', auth_mgt);
app.use('/console/api', api_mgt);

// catch 404 and forward to error handler
app.use((req, res) => {
    const rm = new RestMsg();
    rm.notFoundMsg();
    res.status(rm.code).send(rm);
});

module.exports = app;
