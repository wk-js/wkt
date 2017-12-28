"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const when = require("when");
const utils_1 = require("./utils");
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
                    promise = utils_1.ask(question.message, question.options);
                if (question.action === 'prompt')
                    promise = utils_1.prompt(question.message, question.options);
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
    prompt(message, variable, options) {
        this.questions.push({ message, variable, options, action: 'prompt' });
    }
    answer(variable) {
        return this.answers[variable];
    }
}
exports.PromptAPI = PromptAPI;
