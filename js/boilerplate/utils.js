"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const require_content_1 = require("../utils/require-content");
const print_1 = require("../print");
const utils_1 = require("../api/prompt/utils");
const when_1 = __importDefault(require("when"));
function parse(boilerplate, content, throwOnError = true) {
    let code = "var helpers = this;\n";
    const api = boilerplate.api.helpers;
    for (const key in api) {
        code += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`;
    }
    code += `\n${content}`;
    try {
        require_content_1.requireContent(code, process.cwd() + '/' + boilerplate.path, api);
    }
    catch (e) {
        if (throwOnError)
            throw e;
    }
}
exports.parse = parse;
function get_imports(key, content, path) {
    const line_regex = new RegExp(`\/\/@${key}(\\?)?=.+`, 'g');
    const str_regex = new RegExp(`\/\/@${key}(\\?)?=`, 'g');
    const optional_regex = new RegExp(`\/\/@${key}\\?=`, 'g');
    const lines = content.match(line_regex) || [];
    return when_1.default.reduce(lines, (reducer, line) => {
        const result = line.replace(str_regex, '').trim();
        if (line.match(optional_regex)) {
            return utils_1.ask(print_1.P.grey(`${print_1.P.green('[wkt]')} Do you want to resolve ${print_1.P.green(result)} ?`))
                .then(function (confirm) {
                if (confirm)
                    reducer.push(result);
                return reducer;
            });
        }
        reducer.push(result);
        return reducer;
    }, [])
        .then(function (lines) {
        return lines.filter((line) => !line ? false : (line.length > 0));
    });
}
exports.get_imports = get_imports;
function fetch_optionals(paths, optionals) {
    return when_1.default.reduce(optionals, (r, optional) => {
        return utils_1.ask(print_1.P.grey(`${print_1.P.green('[wkt]')} Do you want to resolve ${print_1.P.green(optional)} ?`))
            .then(function (confirm) {
            if (confirm)
                r.push(optional);
            return r;
        });
    }, paths);
}
exports.fetch_optionals = fetch_optionals;
