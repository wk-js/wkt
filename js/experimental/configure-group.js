"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_group_1 = require("./order-group");
const when_1 = require("when");
function NOOP() { }
class ConfigureGroup extends order_group_1.OrderGroup {
    constructor() {
        super(...arguments);
        this.tasks = {};
        this.counter = {};
        this.currentTask = null;
    }
    get running() {
        return this.currentTask !== null;
    }
    _addTask(key, action) {
        if (this.running)
            return;
        this.tasks[key] = action || this.tasks[key] || NOOP;
    }
    add(key, action) {
        if (this.running)
            return;
        if (typeof key === 'function') {
            action = key;
            key = this.generateName('_#add');
        }
        super.add(key);
        this._addTask(key, action);
    }
    before(bfore, key, action) {
        if (this.running)
            return;
        if (typeof key === 'function') {
            action = key;
            key = this.generateName(bfore + ':#before');
        }
        super.before(bfore, key);
        this._addTask(key, action);
    }
    after(after, key, action) {
        if (this.running)
            return;
        if (typeof key === 'function') {
            action = key;
            key = this.generateName(after + ':#after');
        }
        super.after(after, key);
        this._addTask(key, action);
    }
    first(key, action) {
        if (this.running)
            return;
        if (typeof key === 'function') {
            action = key;
            key = this.generateName('_#first');
        }
        super.first(key);
        this._addTask(key, action);
    }
    last(key, action) {
        if (this.running)
            return;
        if (typeof key === 'function') {
            action = key;
            key = this.generateName('_#last');
        }
        super.last(key);
        this._addTask(key, action);
    }
    execute(hooks) {
        const tasks = this.order.map((key) => {
            return () => {
                const fns = [this.tasks[key]];
                if (hooks && hooks.beforeTask)
                    fns.unshift(hooks.beforeTask);
                if (hooks && hooks.afterTask)
                    fns.push(hooks.afterTask);
                return when_1.reduce(fns, (res, action) => action(), null);
            };
        });
        const promise = when_1.reduce(tasks, (reduction, action, index) => {
            this.currentTask = this.order[index];
            return action();
        }, null);
        return promise.then(() => {
            this.currentTask = null;
        });
    }
    generateName(key) {
        this.counter[key] = (this.counter[key] + 1) || 1;
        return `${key}-${this.counter[key]}`;
    }
}
exports.ConfigureGroup = ConfigureGroup;
const c = new ConfigureGroup;
// c.add('message')
c.after('message', 'yolo');
// c.after('message', 'message:after')
// c.before('message:after', function() {})
// c.after('message', 'lol')
// c.before('yolo', 'message:plouf')
// c.after('message:cool', 'cool')
console.log(c.order);
