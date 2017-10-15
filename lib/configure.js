'use strict'

const when = require('when')

function NOOP() {}

class Configure {

  constructor(context) {
    [ 'add', 'before', 'after', 'ignore', 'execute' ].forEach((k) => this[k] = this[k].bind(this))

    this.context = context || {}

    this.silent = false

    this.tasks   = {}
    this.order   = []
    this.ignores = []
    this.results = []

    this.configured = false
    this._promise   = null
  }

  clone() {
    const configure      = new Configure( this.context )
    configure.silent     = this.silent
    configure.tasks      = Object.assign({}, this.tasks)
    configure.order      = this.order.slice(0)
    configure.ignores    = this.ignores.slice(0)
    configure.results    = this.results.slice(0)
    configure.configured = this.configured
    return configure
  }

  add(key, fn) {
    if (!this.tasks.hasOwnProperty(key)) this.order.push( key )
    this.tasks[key] = fn || NOOP
  }

  before(before, key, fn) {
    this.add(key, fn)
    this.reorder( key, before )
  }

  after(after, key, fn) {
    this.add(key, fn)
    this.reorder( key, after, 'after' )
  }

  reorder(fromKey, toKey, after) {
    const indexFrom = this.order.indexOf(fromKey)
    if (indexFrom == -1) {
      console.log(`[WARN] ${fromKey} task does not exist`)
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

  ignore(key) {
    this.ignores.push( key )
  }

  execute() {
    if (this.configured) return this._promise

    const scope   = this
    const order   = this.order
    const ignores = this.ignores
    const tasks   = this.tasks
    const context = this.context
    const results = this.results

    this._promise = when.reduce(order, (res, name) => {
      if (ignores.indexOf(name) != -1) {
        scope.logger(`Ignore ${name}`)
        return
      }

      try {
        scope.logger(`Execute ${name}`)
        const value = tasks[name].call( context )

        if (when.isPromiseLike(value)) {
          value.then(val => results.push( val ))
        } else {
          results.push( value )
        }

        return value
      } catch(e) {
        scope.logger(`Execute ${name} [FAILED]`)
        scope.logger(e)
      }
    }, null).then(() => {
      return results
    })

    this.configured = true
    return this._promise
  }

  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }

}

module.exports = Configure