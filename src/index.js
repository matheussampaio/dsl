const fs = require('fs');

const DSL = require('./dsl-core');
const commons = require('./dsl-commons');
const parser = require('./dsl-yaml-parser');

const dsl = new DSL();

dsl.setParser(parser);

dsl.use(commons);

module.exports = dsl;
