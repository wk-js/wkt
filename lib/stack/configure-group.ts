import { reduce } from 'when';
import { Configure } from './configure';

export class ConfigureGroup extends Configure {

  groups: { [key:string]: ConfigureGroup } = {}

  group(key:string) {
    let group

    const keys    = key.split(':')
    const rootKey = keys.shift() as string

    if (!this.groups[rootKey]) {
      this.groups[rootKey] = new ConfigureGroup
      this.add( rootKey )
      group = this.groups[rootKey]
    }

    group = this.groups[rootKey]

    if (keys.length > 0) {
      let _g = group

      for (let i = 0, ilen = keys.length; i < ilen; i++) {
        _g = _g.group(keys[i])
      }

      group = _g
    }

    return group
  }

  getFullOrder() {
    let order: string[] = []

    for (let i = 0, ilen = this.order.length; i < ilen; i++) {
      if (this.groups.hasOwnProperty(this.order[i])) {
        order.push( this.order[i] )
        order = order.concat(this.groups[this.order[i]].getFullOrder().map((o:string) => this.order[i] + ':' + o))
      } else {
        order.push( this.order[i] )
      }
    }

    return order
  }

  getGroupTasks(key:string) {
    let tasks: Function[] = []

    if (this.groups[key]) {
      for (const keyTask in this.groups[key].tasks) {
        tasks.push( this.groups[key].tasks[keyTask] )
        tasks = tasks.concat( this.groups[key].getGroupTasks(keyTask) )
      }
    }

    return tasks
  }

  execute(hooks?:any) {
    const tasks = this.order.map((key) => {
      return () => {
        let fns = [ this.tasks[key] ]

        fns = fns.concat( this.getGroupTasks( key ) )

        if (hooks && hooks.beforeTask) fns.unshift( hooks.beforeTask )
        if (hooks && hooks.afterTask)  fns.push   ( hooks.afterTask )

        return reduce(fns, (res:null, action:Function) => action(), null)
      }
    })

    const promise = reduce(tasks, (reduction: null, action: Function, index?: Number) => {
      this.currentTask = this.order[ index as number ]
      return action()
    }, null)

    return promise.then(() => {
      this.currentTask = null
    })
  }

}