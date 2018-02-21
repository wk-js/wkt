"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api/api");
exports.API = api_1.API;
const file_1 = require("./api/file/file");
const boilerplate_1 = require("./api/boilerplate/boilerplate");
const prompt_1 = require("./api/prompt/prompt");
const exec_1 = require("./api/exec/exec");
const boilerplate_2 = require("./boilerplate/boilerplate");
exports.Boilerplate = boilerplate_2.Boilerplate;
api_1.API.Resolver.register('file', file_1.FileAPI);
api_1.API.Resolver.register('boilerplate', boilerplate_1.BoilerplateAPI);
api_1.API.Resolver.register('prompt', prompt_1.PromptAPI);
api_1.API.Resolver.register('exec', exec_1.ExecAPI);
