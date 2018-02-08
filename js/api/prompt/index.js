"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const utils_1 = require("./utils");
class PromptAPI extends index_1.API {
    constructor() {
        super(...arguments);
        this.answers = {};
    }
    get questions() {
        return this.store('questions') ? this.store('questions') : this.store('questions', {});
    }
    init() { }
    bundle() { }
    helpers() {
        return {
            ask: this.ask,
            prompt: this.prompt,
            answer: this.answer,
            choices: this.choices
        };
    }
    ask(message, variable, options) {
        variable = variable || message;
        this.questions[variable] = utils_1.ask(message);
        this.questions[variable].then((answer) => this.answers[variable] = answer);
        return this.questions[variable];
    }
    prompt(message, variable, options) {
        variable = variable || message;
        this.questions[variable] = utils_1.prompt(message);
        this.questions[variable].then((answer) => this.answers[variable] = answer);
        return this.questions[variable];
    }
    choices(message, variable, list, options) {
        variable = variable || message;
        this.questions[variable] = utils_1.choices(message, list, options);
        this.questions[variable].then((answer) => this.answers[variable] = answer);
        return this.questions[variable];
    }
    // chain( message:string, variable:string, list:{ [key:string]:any }, options?:any ) {
    //   const keys = Object.keys( list )
    //   return this.choices(message, variable, keys).then((answer:string) => {
    //     if (list.hasOwnProperty(answer)) {
    //       const method = list[answer].method as Function
    //       return method.apply(this, list[answer].parameters)
    //     }
    //   })
    // }
    answer(variable) {
        return this.answers[variable];
    }
}
exports.PromptAPI = PromptAPI;
