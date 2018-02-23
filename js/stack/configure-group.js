"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const when_1 = require("when");
const configure_1 = require("./configure");
class ConfigureGroup extends configure_1.Configure {
    constructor() {
        super(...arguments);
        this.groups = {};
    }
    group(key) {
        let group;
        const keys = key.split(':');
        const rootKey = keys.shift();
        if (!this.groups[rootKey]) {
            this.groups[rootKey] = new ConfigureGroup;
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
    getGroupTasks(key) {
        let tasks = [];
        if (this.groups[key]) {
            for (const keyTask in this.groups[key].tasks) {
                tasks.push(this.groups[key].tasks[keyTask]);
                tasks = tasks.concat(this.groups[key].getGroupTasks(keyTask));
            }
        }
        return tasks;
    }
    execute(hooks) {
        const tasks = this.order.map((key) => {
            return () => {
                let fns = [this.tasks[key]];
                fns = fns.concat(this.getGroupTasks(key));
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
}
exports.ConfigureGroup = ConfigureGroup;
