import { reduce } from 'when';
import { Configure } from './configure';
import { P } from '../print'

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
    let tasks: ({ key:string, action:Function })[] = []

    if (this.groups[key]) {
      for (const keyTask in this.groups[key].tasks) {
        tasks.push({ key: key + ':' + keyTask, action: this.groups[key].tasks[keyTask] })
        tasks = tasks.concat(this.groups[key].getGroupTasks(keyTask).map(function(task) {
          task.key = key + ':' + task.key
          return task
        }))
      }
    }

    return tasks
  }

  execute(hooks?:any) {
    const tasks = this.order.map((key) => {
      return () => {
        let fns = [{ key: key, action: this.tasks[key] }]

        fns = fns.concat( this.getGroupTasks( key ) )

        if (hooks && hooks.beforeTask) fns.unshift({ key: key + ':before', action: hooks.beforeTask })
        if (hooks && hooks.afterTask)  fns.push   ({ key: key + ':after' , action: hooks.afterTask  })

        return reduce(fns, (res:null, task:{ key:string, action:Function }) => {
          P.verbose( `Execute ${task.key}` )
          return task.action()
        }, null)
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