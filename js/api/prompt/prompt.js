"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const when = require("when");
function prompt(message, options) {
    return when.promise(function (resolve) {
        options = Object.assign({
            empty: false
        }, options || {});
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');
        process.stdout.write(message + ' ');
        function onData(data) {
            const str = data.toString().trim();
            if (str.length === 0 && !options.empty) {
                process.stdout.write(`Cannot be empty\n`);
                process.stdout.write(message + ' ');
                return;
            }
            process.stdin.removeListener("data", onData);
            resolve(str);
            process.stdin.pause();
        }
        process.stdin.on("data", onData);
    });
}
function ask(message, options) {
    options = typeof options === 'object' ? options : {};
    const defaultAnswer = options.hasOwnProperty('defaultAnswer') ? options.defaultAnswer : 'y';
    function answer(r) {
        const matches = (r.length == 0 ? defaultAnswer : r).match(/^(y|yes|\n)$/i);
        if (matches && typeof options.callback === 'function')
            return options.callback();
        return !!matches;
    }
    if (options.skip)
        return when(defaultAnswer).then(answer);
    return prompt(message + ` (y|yes|n|no) (Default: ${defaultAnswer})`, { empty: true }).then(answer);
}
class PromptAPI extends index_1.API {
    constructor() {
        super(...arguments);
        this.answers = {};
    }
    get questions() {
        return this.store('questions') ? this.store('questions') : this.store('questions', []);
    }
    init() {
        this.boilerplate.stack.before('bundle', 'prompt');
    }
    bundle() {
        const tasks = this.questions.map((question) => {
            return () => {
                let promise;
                if (question.action === 'ask')
                    promise = ask(question.message, question.options);
                if (question.action === 'prompt')
                    promise = prompt(question.message);
                return promise.then((value) => {
                    this.answers[question.variable] = value;
                });
            };
        });
        return when.reduce(tasks, (res, action) => action(), null);
    }
    helpers() {
        return {
            ask: this.ask,
            prompt: this.prompt,
            answer: this.answer
        };
    }
    ask(message, variable, options) {
        this.questions.push({ message, variable, options, action: 'ask' });
    }
    prompt(message, variable) {
        this.questions.push({ message, variable, action: 'prompt' });
    }
    answer(variable) {
        return this.answers[variable];
    }
}
exports.PromptAPI = PromptAPI;
