"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const when = require("when");
function prompt(message, options) {
    options = Object.assign({
        empty: false
    }, options || {});
    if (options.hasOwnProperty('defaultAnswer')) {
        message = `${message} (Default: ${options.defaultAnswer})`;
        options.empty = true;
    }
    return when.promise(function (resolve) {
        process.stdin.resume();
        process.stdin.setEncoding('utf-8');
        process.stdout.write(message + ' ');
        function onData(data) {
            let str = data.toString().trim();
            if (str.length === 0) {
                if (options.empty) {
                    str = options.defaultAnswer;
                }
                else {
                    process.stdout.write(`Cannot be empty\n`);
                    process.stdout.write(message + ' ');
                    return;
                }
            }
            process.stdin.removeListener("data", onData);
            resolve(str);
            process.stdin.pause();
        }
        process.stdin.on("data", onData);
    });
}
exports.prompt = prompt;
function ask(message, options) {
    options = typeof options === 'object' ? options : {};
    options.defaultAnswer = 'y';
    options.empty = true;
    return choices(message, ['y', 'yes', 'n', 'no'], options)
        .then((answer) => !!answer.match(/^(y|yes)$/i));
}
exports.ask = ask;
function choices(message, answers, options) {
    message = `${message} [${answers.join('|')}]`;
    return prompt(message, options)
        .then((answer) => {
        if (answers.indexOf(answer) === -1) {
            process.stdout.write(`"${answer}" is an invalid answer\n`);
            return prompt(message, options);
        }
        return answer;
    });
}
exports.choices = choices;
