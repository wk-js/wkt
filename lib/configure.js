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

    this.configured = false
    this._promise   = null
  }

  clone() {
    const configure      = new Configure( this.context )
    configure.silent     = this.silent
    configure.tasks      = Object.assign({}, this.tasks)
    configure.order      = this.order.slice(0)
    configure.ignores    = this.ignores.slice(0)
    configure.configured = this.configured
    return configure
  }

  add(key, fn) {
    if (!this.tasks.hasOwnProperty(key)) this.order.push( key )
    this.tasks[key] = fn || NOOP
  }

  before(before, key, fn) {
    this.add(key, fn)

    const indexFrom = this.order.indexOf(key)
    if (indexFrom == -1) {
      console.log(`[WARN] ${key} task does not exist`)
      return
    }

    const indexTo   = this.order.indexOf(before)
    if (indexTo == -1) {
      console.log(`[WARN] ${before} task does not exist`)
      return
    }

    this.order.splice(indexFrom, 1)
    this.order.splice(indexTo, 0, key)
  }

  after(after, key, fn) {
    this.add(key, fn)

    const indexFrom = this.order.indexOf(key)
    if (indexFrom == -1) {
      console.log(`[WARN] ${key} task does not exist`)
      return
    }

    const indexTo   = this.order.indexOf(after)
    if (indexTo == -1) {
      console.log(`[WARN] ${after} task does not exist`)
      return
    }

    this.order.splice(indexFrom, 1)
    this.order.splice(indexTo+1, 0, key)
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

    this._promise = when.reduce(order, (res, name) => {
      if (ignores.indexOf(name) != -1) {
        scope.logger(`Ignore ${name}`)
        return
      }

      try {
        scope.logger(`Execute ${name}`)
        return tasks[name].call( context )
      } catch(e) {
        scope.logger(`Execute ${name} [FAILED]`)
        scope.logger(e)
      }
    }, null).then(() => {
      return context
    })

    this.configured = true
    return this._promise
  }

  logger() {
    if (!this.silent) console.log.apply(null, arguments)
  }

}

module.exports = Configure