"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_1 = require("./order");
const when_1 = require("when");
function NOOP() { }
class Configure extends order_1.Order {
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
        super.add(key);
        this._addTask(key, action);
    }
    before(bfore, key, action) {
        if (this.running)
            return;
        super.before(bfore, key);
        this._addTask(key, action);
    }
    after(after, key, action) {
        if (this.running)
            return;
        super.after(after, key);
        this._addTask(key, action);
    }
    insert(action) {
        if (this.running)
            return;
        const key = this.generateName('_#add');
        this.add(key, action);
    }
    insertBefore(bfore, action) {
        if (this.running)
            return;
        const key = this.generateName(bfore + '#before');
        this.before(bfore, key, action);
    }
    insertAfter(after, action) {
        if (this.running)
            return;
        const key = this.generateName(after + '#after');
        this.after(after, key, action);
    }
    execute(hooks) {
        const tasks = this.order.map((key) => {
            return () => {
                const fns = [this.tasks[key]];
                if (hooks.beforeTask)
                    fns.unshift(hooks.beforeTask);
                if (hooks.afterTask)
                    fns.push(hooks.afterTask);
                return when_1.reduce(fns, (res, action) => action(), null);
            };
        });
        const promise = when_1.reduce(tasks, (res, action, index) => {
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
exports.Configure = Configure;
