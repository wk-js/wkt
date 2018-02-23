"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("./order");
class OrderGroup extends order_1.Order {
    constructor() {
        super(...arguments);
        this.groups = {};
    }
    group(key) {
        let group;
        const keys = key.split(':');
        const rootKey = keys.shift();
        if (!this.groups[rootKey]) {
            this.groups[rootKey] = new OrderGroup;
            this.add(rootKey);
            group = this.groups[rootKey];
        }
        group = this.groups[rootKey];
        if (keys.length > 0) {
            let _g = group;
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                _g = _g.group(keys[i]);
            }
            group = _g;
        }
        return group;
    }
    getFullOrder() {
        let order = [];
        for (let i = 0, ilen = this.order.length; i < ilen; i++) {
            if (this.groups.hasOwnProperty(this.order[i])) {
                order.push(this.order[i]);
                order = order.concat(this.groups[this.order[i]].getFullOrder().map((o) => this.order[i] + ':' + o));
            }
            else {
                order.push(this.order[i]);
            }
        }
        return order;
    }
}
exports.OrderGroup = OrderGroup;
