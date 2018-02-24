"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const utils_1 = require("../api/prompt/utils");
exports.PromptAPI = api_1.API.extend('prompt', {
    computed: {
        answers() {
            return this.shared_store('answers') ? this.shared_store('answers') : this.shared_store('answers', {});
        },
        questions() {
            return this.store('questions') ? this.store('questions') : this.store('questions', {});
        }
    },
    helpers() {
        return {
            ask: this.ask,
            prompt: this.prompt,
            answer: this.answer,
            choices: this.choices
        };
    },
    methods: {
        ask(message, variable, options) {
            variable = variable || message;
            this.questions[variable] = utils_1.ask(message);
            this.questions[variable].then((answer) => this.answers[variable] = answer);
            return this.questions[variable];
        },
        prompt(message, variable, options) {
            variable = variable || message;
            this.questions[variable] = utils_1.prompt(message);
            this.questions[variable].then((answer) => this.answers[variable] = answer);
            return this.questions[variable];
        },
        choices(message, variable, list, options) {
            variable = variable || message;
            this.questions[variable] = utils_1.choices(message, list, options);
            this.questions[variable].then((answer) => this.answers[variable] = answer);
            return this.questions[variable];
        },
        answer(variable) {
            return this.answers[variable];
        }
    }
});
