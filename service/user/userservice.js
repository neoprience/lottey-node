/**
 * Created by LQ on 2019/7/12
 */
const ServiceGenerator = require('../common/servicegenerator');
const User = require('./model/userbo');

const UserService = ServiceGenerator.generate(User, 'name id_number mobile user_id');

module.exports = UserService;
