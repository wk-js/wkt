import { OrderGroup } from './order-group';
import { Order } from '../stack/order';
import { reduce } from 'when';

function NOOP() {}

export interface ConfigureGroupTasks {
  [key: string]: Function
}

export class ConfigureGroup extends OrderGroup {

  tasks: ConfigureGroupTasks = {}
  counter: { [key:string]: number } = {}
  currentTask: string | null = null

  get running() {
    return this.currentTask !== null
  }

  _addTask( key:string, action?:Function ) {
    if (this.running) return;
    this.tasks[key] = action || this.tasks[key] || NOOP
  }

  add( key:string | Function, action?:Function ) {
    if (this.running) return;

    if (typeof key === 'function') {
      action = key as Function
      key = this.generateName( '_#add' )
    }

    super.add( key as string )
    this._addTask( key as string, action )
  }

  before( bfore:string, key:string | Function, action?:Function ) {
    if (this.running) return;

    if (typeof key === 'function') {
      action = key as Function
      key = this.generateName( bfore+':#before' )
    }

    super.before( bfore, key as string )
    this._addTask( key as string, action )
  }

  after( after:string, key:string | Function, action?:Function ) {
    if (this.running) return;

    if (typeof key === 'function') {
      action = key as Function
      key = this.generateName( after+':#after' )
    }

    super.after( after, key as string )
    this._addTask( key as string, action )
  }

  first( key:string | Function, action?:Function ) {
    if (this.running) return;

    if (typeof key === 'function') {
      action = key as Function
      key = this.generateName( '_#first' )
    }

    super.first( key as string )
    this._addTask( key as string, action )
  }

  last( key:string | Function, action?:Function ) {
    if (this.running) return;

    if (typeof key === 'function') {
      action = key as Function
      key = this.generateName( '_#last' )
    }

    super.last( key as string )
    this._addTask( key as string, action )
  }

  execute(hooks?:any) {
    const tasks = this.order.map((key) => {
      return () => {
        const fns = [ this.tasks[key] ]

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

  private generateName( key:string ) {
    this.counter[key] = (this.counter[key] + 1) || 1
    return `${key}-${this.counter[key]}`
  }

}


const c = new ConfigureGroup

// c.add('message')

c.after('message', 'yolo')

// c.after('message', 'message:after')
// c.before('message:after', function() {})
// c.after('message', 'lol')
// c.before('yolo', 'message:plouf')
// c.after('message:cool', 'cool')

console.log( c.order )