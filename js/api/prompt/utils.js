"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.prompt = prompt;
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
exports.ask = ask;
