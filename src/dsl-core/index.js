const _ = require('lodash');
const debug = require('debug')('dsl');

class DSL {
    constructor() {
        this.actions = {};
        this.parser = null;
    }

    setParser(parser) {
        this.parser = parser;
    }

    use(actions) {
        if (!_.isArray(actions)) {
            return Promise.reject(new Error('actions should be an array'));
        }

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            if (action.name == null) {
                return Promise.reject(new Error(`Missing action name: ${action}`));
            }

            if (typeof action.name !== 'string') {
                return Promise.reject(new Error(`Action name should be a string: ${action}`));
            }

            if (action.run == null) {
                return Promise.reject(new Error(`Missing action run function: ${action}`));
            }

            if (typeof action.run !== 'function') {
                return Promise.reject(new Error(`Action run should be a function: ${action}`))
            }

            this.actions[action.name] = action;
        }

        return Promise.resolve();
    }

    async verify(script) {
        debug('verifying script');

        if (!_.isArray(script)) {
            debug('error: script should be an array');
            return Promise.reject(new Error(`script should be an array: ${script}`));
        }

        for (let i = 0; i < script.length; i++) {
            const { name, params, others } = script[i];

            if (name == null) {
                debug(`error: missing action name: i=${i}`);
                return Promise.reject(new Error(`Missing action name: i=${i}`));
            }

            if (typeof name !== 'string') {
                debug(`error: action name should be a string: i=${i} name=${name}`);
                return Promise.reject(new Error(`Action name should be a string: i=${i} name=${name}`));
            }

            const action = this.actions[name];

            if (action == null) {
                debug(`error: unknown action name: i=${i} name=${name}`);
                return Promise.reject(new Error(`unknown action name: i=${i} name=${name}`));
            }

            await action.verify({ params, others });
        }

        debug('script is valid');

        return Promise.resolve();
    }

    async run(scriptAsString) {
        if (this.parser == null) {
            return Promise.reject(new Error('Parser not initialized'));
        }

        const script = await this.parser(scriptAsString);

        await this.verify(script);

        const next = {};

        for (let i = 0; i < script.length; i++) {
            const { name, params, others } = script[i];

            const actionFn = this.actions[name];

            await actionFn.run({ params, others, next, actions: this.actions });
        }

        return Promise.resolve();
    }
}

module.exports = DSL;
