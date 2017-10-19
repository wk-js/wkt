'use strict'

const when = require('when')

function NOOP(v) { return v }

class Configure {

  constructor() {
    const bound = [ 'add', 'before', 'after', 'ignore', 'execute', 'logger', 'reorder' ]
    bound.forEach((k) => this[k] = this[k].bind(this))

    this.silent = false

    this.tasks   = {}
    this.order   = []
    this.ignores = []
    this.results = []

    this.autocreate = false

    this._promise   = null
  }

  /**
   * Clone configure
   *
   * @returns
   * @memberof Configure
   */
  clone() {
    const configure      = new Configure
    configure.silent     = this.silent
    configure.tasks      = Object.assign({}, this.tasks)
    configure.order      = this.order.slice(0)
    configure.ignores    = this.ignores.slice(0)
    configure.results    = this.results.slice(0)
    configure.autocreate = this.autocreate
    return configure
  }

  /**
   * Add task
   *
   * @param {String} key
   * @param {Any} fn
   * @memberof Configure
   */
  add(key, action) {
    if (typeof key !== 'string') return console.log('Invalid key')
    if (!this.tasks.hasOwnProperty(key)) this.order.push( key )
    this.tasks[key] = action || NOOP
  }

  /**
   * Add task before another one
   *
   * @param {String} before
   * @param {String} key
   * @param {Any} fn
   * @memberof Configure
   */
  before(before, key, fn) {
    if (this.order.indexOf(before) == -1 && this.autocreate) this.add(before)
    this.add(key, fn)
    this.reorder( key, before, false )
  }

  /**
   * Add task before another one
   *
   * @param {String} before
   * @param {String} key
   * @param {Any} fn
   * @memberof Configure
   */
  after(after, key, fn) {
    if (this.order.indexOf(after) == -1 && this.autocreate) this.add(after)
    this.add(key, fn)
    this.reorder( key, after, true )
  }

  /**
   * Reorder tasks
   *
   * @param {String} fromKey
   * @param {String} toKey
   * @param {Boolean} after
   * @memberof Configure
   */
  reorder(fromKey, toKey, after) {
    const indexFrom = this.order.indexOf(fromKey)
    if (indexFrom == -1) {
      console.trace(`[WARN] ${fromKey} task does not exist`)
      return
    }

    const indexTo = this.order.indexOf(toKey)
    if (indexTo == -1) {
      console.log(`[WARN] ${toKey} task does not exist`)
      return
    }

    this.order.splice(indexFrom, 1)
    this.order.splice(indexTo + (after?1:0), 0, fromKey)
  }

  /**
   * Ignore task
   *
   * @param {String} key
   * @memberof Configure
   */
  ignore(key) {
    this.ignores.push( key )
  }

  /**
   * Execute tasks execution
   *
   * @returns {Promise}
   * @memberof Configure
   */
  execute( context, reducer ) {
    if (this._promise) return this._promise

    const next = (previous, resolve) => {
      reducer = reducer || NOOP

      const order   = this.order
      const ignores = this.ignores
      const tasks   = this.tasks
      const results = this.results

      const index = !previous ? 0 : this.order.indexOf(previous) + 1
      const name  = order[index]

      if (!tasks[name]) return resolve( results )
      if (ignores.indexOf(name) != -1) return next( name, resolve )

      let value

      if (typeof tasks[name] === 'function') {
        value = tasks[name].call( context )
      } else {
        value = tasks[name]
      }

      value = reducer( value, name )

      if (when.isPromiseLike(value)) {
        return value
        .then(val => results.push( val ))
        .then(res => next( name, resolve ))
      } else {
        results.push( value )
      }

      next( name, resolve )
    }

    return when.promise(function(resolve) {
      next( null, resolve )
    })

    // if (this._promise) return this._promise


    // this._promise = when.reduce(order, (res, name) => {
    //   if (ignores.indexOf(name) != -1) return

    //   let value

    //   if (typeof tasks[name] === 'function') {
    //     value = tasks[name].call( context )
    //   } else {
    //     value = tasks[name]
    //   }

    //   value = reducer( value )

    //   if (when.isPromiseLike(value)) {
    //     value.then(val => results.push( val ))
    //   } else {
    //     results.push( value )
    //   }

    //   return value

    // }, null).then(() => {
    //   return results
    // })

    // return this._promise
  }

  /**
   * Logger
   *
   * @memberof Configure
   */
  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }

  /**
   *
   *
   * @param {any} key
   * @returns
   * @memberof Configure
   */
  get(key) {
    const regex = new RegExp(`^${key}`)

    return this.order

    .filter((k) => {
      return k.match(regex)
    })

    .map((k) => {
      return this.tasks[k]
    })
  }
}

module.exports = Configure