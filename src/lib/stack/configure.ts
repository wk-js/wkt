import { Iterator } from '../utils/iterator'
import { setTimeout } from 'timers'
import { Order } from './order'
import * as when from 'when'
import { IteratorResult } from '../utils/iterator'
import { reduce } from 'when';

function NOOP() {}

export interface ConfigureTasks {
  [key: string]: Function
}

export class Configure extends Order {

  tasks: ConfigureTasks = {}
  counter: { [key:string]: number } = {}
  currentTask: string | null = null

  get running() {
    return this.currentTask !== null
  }

  _addTask( key:string, action?:Function ) {
    if (this.running) return;
    this.tasks[key] = action || this.tasks[key] || NOOP
  }

  add( key:string, action?:Function ) {
    if (this.running) return;
    super.add( key )
    this._addTask( key, action )
  }

  before( bfore:string, key:string, action?:Function ) {
    if (this.running) return;
    super.before( bfore, key )
    this._addTask( key, action )
  }

  after( after:string, key:string, action?:Function ) {
    if (this.running) return;
    super.after( after, key )
    this._addTask( key, action )
  }

  insert( action?:Function ) {
    if (this.running) return;
    const key = this.generateName( '_#add' )
    this.add( key, action )
  }

  insertBefore( bfore:string, action?:Function ) {
    if (this.running) return;
    const key = this.generateName( bfore+'#before' )
    this.before( bfore, key, action )
  }

  insertAfter( after:string, action?:Function ) {
    if (this.running) return;
    const key = this.generateName( after+'#after' )
    this.after( after, key, action )
  }

  execute(hooks?:any) {
    const tasks = this.order.map((key) => {
      return () => {
        const fns = [ this.tasks[key] ]

        if (hooks.beforeTask) fns.unshift( hooks.beforeTask )
        if (hooks.afterTask)  fns.push   ( hooks.afterTask )

        return reduce(fns, (res:null, action:Function) => action(), null)
      }
    })

    const promise = reduce(tasks, (res:null, action:Function, index: number) => {
      this.currentTask = this.order[ index ]
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