import { Iterator } from '../utils/iterator'
import { setTimeout } from 'timers'
import { Order } from './order'
import * as when from 'when'
import { IteratorResult } from '../utils/iterator';

function NOOP( next:Function ) { next() }

export interface ConfigureAction {
  ( next:Function ): void;
}

export interface ConfigureTasks {
  [key: string]: ConfigureAction
}

export class ConfigureIterator implements Iterator<any> {

  pointer = -1;
  done:boolean = false

  constructor(public configure:Configure) {
    const scope = this
    const next  = this.next
    this.next   = function() {
      return next.apply( scope, arguments )
    }
  }

  next() {
    this.pointer++

    if (this.pointer < this.configure.order.length) {
      return {
        done: false,
        value: {
          id: this.configure.order[this.pointer],
          value: this.configure.tasks[this.configure.order[this.pointer]]( this.next )
        }
      }
    }

    this.done = true

    return {
      done: true,
      value: null
    }
  }

  [Symbol.iterator]() {
    return this
  }

}

export class Configure extends Order {

  tasks: ConfigureTasks = {}
  counter: { [key:string]: number } = {}

  _addTask( key:string, action?:ConfigureAction ) {
    this.tasks[key] = action || this.tasks[key] || NOOP
  }

  private generateName( key:string ) {
    this.counter[key] = (this.counter[key] + 1) || 1
    return `${key}-${this.counter[key]}`
  }

  add( key:string, action?:ConfigureAction ) {
    super.add( key )
    this._addTask( key, action )
  }

  before( bfore:string, key:string, action?:ConfigureAction ) {
    super.before( bfore, key )
    this._addTask( key, action )
  }

  after( after:string, key:string, action?:ConfigureAction ) {
    super.after( after, key )
    this._addTask( key, action )
  }

  insert( action?:ConfigureAction ) {
    const key = this.generateName( '_#add' )
    this.add( key, action )
  }

  insertBefore( bfore:string, action?:ConfigureAction ) {
    const key = this.generateName( bfore+'#before' )
    this.before( bfore, key, action )
  }

  insertAfter( after:string, action?:ConfigureAction ) {
    const key = this.generateName( after+'#after' )
    this.after( after, key, action )
  }

  iterator() {
    return new ConfigureIterator(this)
  }

  execute(progress:Function) {
    const iterator = this.iterator()

    return when.iterate(
      function reducer() {
        const result = iterator.next().value
        if (progress) return progress( result )
        return result
      },

      function predicate() {
        return iterator.done
      },

      function handler() {},

      0
    )
  }

}