const _ = require('lodash');
const yaml = require('js-yaml');
const debug = require('debug')('dsl-yaml-parser');

const populate = function populate(node) {
    const children = [];

    for (let i = 0; i < node.length; i++) {
        const e = node[i];
        const key = _.keys(e)[0];

        const name = key.split(' ')[0];
        const others = key.split(' ').splice(1);

        let params = [];

        if (_.isArray(e[key])) {
            params = populate(e[key]);
        } else {
            params = e[key];
        }

        children.push({ name, others, params });
    }

    return children;
};

const parser = function parser(text) {
    const node = yaml.safeLoad(text);

    if (node == null) {
        return Promise.resolve([]);
    }

    debug(JSON.stringify(node, null, 4));

    const script = populate(node);

    debug(JSON.stringify(script, null, 4));

    return Promise.resolve(script);
};

module.exports = parser;
