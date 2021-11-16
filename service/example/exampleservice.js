/**
 * Created by LQ on 2019/11/15
 */
const ServiceGenerator = require('../common/servicegenerator');
const Example = require('./model/examplebo');

const ExampleService = ServiceGenerator.generate(Example);

module.exports = ExampleService;
