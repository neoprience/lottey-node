const express = require('express');
const router = express.Router();
const auth = require('./auth');

router.all('*', (req, res, next) => { // 鉴权
    if (inAuthList(req)) {
        auth(req, res, next);
    } else {
        next();
    }
});

function inAuthList(req) {
    const authList = [];
    const current = req.method.toLowerCase() + req.path;
    let inAuthList = false;
    if (authList.length) {
        for (let i = 0; i < authList.length; i++) {
            if (current.indexOf(authList[i]) > -1) {
                inAuthList = true;
                break;
            }
        }
    }
    return inAuthList;
}

const user = require('./user/user');
const example = require('./example/example');
const upload = require('../common/upload');
const unionLotto = require('./union-lotto/union-lotto');
const selfUnionLotto = require('./union-lotto/self-union-lotto');
router.use('/users', user);
router.use('/examples', example);
router.use('/upload', upload);
router.use('/unionLotto', unionLotto);
router.use('/selfUnionLotto', selfUnionLotto);

module.exports = router;
