const _ = require('lodash');
const debug = require('debug')('dsl:dsl-commons');

const actions = [
    {
        name: 'print',
        verify({ params }) {
            if (typeof params !== 'string') {
                debug('error: params should be a string');
                return Promise.reject(new Error('Action: Print. params should be a string'));
            }

            return Promise.resolve();
        },
        run({ params }) {
            debug(`print ${params}`);

            console.log(params);

            return Promise.resolve();
        }
    },
    {
        name: 'delay',
        verify({ params }) {
            if (typeof params !== 'number') {
                debug('error: params should be a number');
                return Promise.reject(new Error('Action: Delay. Params should be a number'));
            }

            return Promise.resolve();
        },
        run({ params }) {
            return new Promise((resolve, reject) => {
                debug(`delay ${params}`);

                setTimeout(() => resolve(), params);
            });
        }
    },
    {
        name: 'for',
        verify({ params, others }) {
            if (others.length != 3) {
                return Promise.reject(new Error('Action: For. need 3 params'));
            }

            let from = 0;
            let to = 0;

            try {
                from = parseInt(others[0], 10);
                to = parseInt(others[2], 10);
            } catch (error) {
                return Promise.reject(new Error(`Action For. Can't parse to int: from=${others[0]} to=${others[1]}`));
            }

            if (!_.isArray(params)) {
                return Promise.reject(new Error(`Action For. params should be an array: ${params}`));
            }

            return Promise.resolve();
        },
        async run({ params, others, next, actions }) {
            const from = parseInt(others[0], 10);
            const to = parseInt(others[2], 10);

            for (let j = from; j < to; j++) {
                debug(`for ${j} to ${to}`);

                for (let i = 0; i < params.length; i++) {
                    const action = params[i];
                    const actionFn = actions[action.name];

                    await actionFn.run({
                        next,
                        actions,
                        params: action.params,
                        others: action.others
                    });
                }
            }

            return Promise.resolve();
        }
    }
];

module.exports = actions;
