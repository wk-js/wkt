"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
function NOOP() { }
var Order = /** @class */ (function () {
    function Order() {
        this.order = [];
    }
    Order.prototype.exists = function (key) {
        return this.order.indexOf(key) !== -1;
    };
    Order.prototype.index = function (key) {
        return this.order.indexOf(key);
    };
    Order.prototype.add = function (key) {
        if (!this.exists(key))
            this.order.push(key);
    };
    Order.prototype.before = function (bfore, key) {
        if (!this.exists(bfore)) {
            console.log("[WARN] " + bfore + " does not exist.");
            return;
        }
        this.add(key);
        this.reorder(bfore, key);
    };
    Order.prototype.after = function (after, key) {
        if (!this.exists(after)) {
            console.log("[WARN] " + after + " does not exist.");
            return;
        }
        this.add(key);
        this.reorder(key, after);
    };
    Order.prototype.reorder = function (fk, tk) {
        var fi = this.index(fk);
        var ti = this.index(tk);
        if (!(fi !== -1 && ti !== -1))
            return;
        this.order.splice(fi, 1);
        this.order.splice(ti + 1, 0, fk);
    };
    Order.prototype.execute = function (reducer) {
        // this.order.reduce((key) => {
        //   reducer = reducer || NOOP
        //   reducer( key )
        //   return key
        // }, [])
    };
    return Order;
}());
exports.Order = Order;
var Configure = /** @class */ (function (_super) {
    __extends(Configure, _super);
    function Configure() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tasks = {};
        return _this;
    }
    Configure.prototype.add = function (key, action) {
        _super.prototype.add.call(this, key);
        this.tasks[key] = action || NOOP;
    };
    return Configure;
}(Order));
exports.Configure = Configure;
var o = new Order;
o.add('start');
o.add('configure');
o.before('configure', 'configure:before');
o.after('configure', 'configure:after');
exports.default = Order;
