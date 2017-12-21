"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Order {
    constructor() {
        this.order = [];
        this.rules = {};
    }
    exists(key) {
        return this.order.indexOf(key) !== -1;
    }
    index(key) {
        return this.order.indexOf(key);
    }
    _add(key) {
        if (!this.exists(key)) {
            this.order.push(key);
            this.rules[key] = { before: this.order.slice(0, this.order.length - 1), after: [] };
        }
    }
    before(bfore, key) {
        this._add(key);
        this._add(bfore);
        this.updateRules(key, bfore, 'before');
        this.reorder();
    }
    after(after, key) {
        this._add(key);
        this._add(after);
        this.updateRules(key, after, 'after');
        this.reorder();
    }
    add(key) {
        this._add(key);
        this.refreshRules();
    }
    first(key) {
        this.order[0] ?
            this.before(this.order[0], key) :
            this.add(key);
    }
    last(key) {
        this.order[this.order.length - 1] ?
            this.after(this.order[this.order.length - 1], key) :
            this.add(key);
    }
    rule(direction, keyRule, key) {
        if (this.rules[keyRule][direction].indexOf(key) === -1) {
            this.rules[keyRule][direction].push(key);
            const idir = direction === 'before' ? 'after' : 'before';
            const index = this.rules[keyRule][idir].indexOf(key);
            if (index !== -1)
                this.rules[keyRule][idir].splice(index, 1);
        }
    }
    refreshRules() {
        const rules = {};
        for (let i = 0, ilen = this.order.length, key; i < ilen; i++) {
            key = this.order[i];
            rules[key] = {
                before: this.order.slice(0, i),
                after: this.order.slice(i + 1, ilen)
            };
        }
        this.rules = rules;
    }
    updateRules(key, relative, direction) {
        if (direction === 'before') {
            this.rules[key].after = this.rules[relative].after.slice(0);
            this.rules[key].after.push(relative);
            this.rules[key].before = this.rules[relative].before.slice(0);
        }
        else {
            this.rules[key].before = this.rules[relative].before.slice(0);
            this.rules[key].before.push(relative);
            this.rules[key].after = this.rules[relative].after.slice(0);
        }
        for (let i = 0, ilen = this.order.length; i < ilen; i++) {
            if (this.rules[key].before.indexOf(this.order[i]) > -1) {
                this.rule('after', this.order[i], key);
            }
            if (this.rules[key].after.indexOf(this.order[i]) > -1) {
                this.rule('before', this.order[i], key);
            }
        }
    }
    reorder() {
        const order = [this.order[0]];
        let k0, k1, cursor = 0;
        for (let i = 1, ilen = this.order.length; i < ilen; i++) {
            k0 = this.order[i];
            cursor = 0;
            // console.log('-----------')
            for (let j = 0, jlen = order.length; j < jlen; j++) {
                k1 = order[j];
                if (this.rules[k1].before.indexOf(k0) > -1) {
                    // console.log( `before ${k1} ${k0}` )
                    cursor--;
                    continue;
                }
                // if ( this.rules[k1].after.indexOf( k0 ) > -1 ) {
                // console.log( `after ${k1} ${k0}` )
                // cursor++
                // continue
                // }
            }
            const index = Math.max(0, order.length + cursor);
            // console.log( k0, order, cursor, index )
            order.splice(index, 0, k0);
            // console.log( order )
        }
        this.order = order;
        this.refreshRules();
    }
}
exports.Order = Order;
