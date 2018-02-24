"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const print_1 = require("wk-print/js/print");
const tag_1 = require("wk-print/js/extensions/tag");
const _P = new print_1.Print;
_P.config.extension(tag_1.TagExtension);
_P.config.category({
    name: 'debug',
    visible: true,
    extensions: {
        style: { styles: ['grey'] },
        tag: { tag: 'wkt', styles: ['cyan'] }
    }
});
_P.config.category({
    name: 'verbose',
    visible: false,
    extensions: {
        style: { styles: ['grey'] },
        tag: { tag: 'wkt-verbose', styles: ['cyan'] }
    }
});
exports.P = _P;
