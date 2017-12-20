"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MixinBuilder {
    constructor(Base) {
        this.Base = Base;
    }
    with(...mixins) {
        return mixins.reduce((c, mixin) => {
            return mixin(c);
        }, this.Base);
    }
}
exports.MixinBuilder = MixinBuilder;
class MixinClass {
}
exports.MixinClass = MixinClass;
function Mixin(Base) {
    return new MixinBuilder(Base);
}
exports.Mixin = Mixin;
