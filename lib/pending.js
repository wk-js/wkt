'use strict'

const when = require('when')

class Pending {

  constructor( callback ) {
    this.next = this.next.bind(this)
    this.push = this.push.bind(this)
    this.done = this.done.bind(this)

    this.autoexec  = true
    this.process   = false
    this.resolves  = []
    this.callback  = callback
    this.listeners = { done: [] }

    this.defer = null
  }

  get empty() {
    return this.resolves.length == 0
  }

  _create_promise(action) {
    this.defer = {}

    this.defer.promise = when.promise((resolve) => {
      this.defer.resolve = resolve
      if (action) action()
    })

    return this.defer.promise
  }

  next() {
    if (!this.defer) {
      return this._create_promise(() => {
        setTimeout(this.next, 100)
      })
    }

    const resolve = this.resolves.shift()
    if (!resolve) return this._done()

    resolve()
    return this.defer.promise
  }

  push() {
    const args = Array.prototype.slice.apply(arguments)

    return when

    .promise((resolve) => {
      this.resolves.push( resolve )
      if (!this.process && this.autoexec) this.next()
    })

    .then(() => {
      return this.callback.apply(null, args)
    })
  }

  start() {
    return this.next()
  }

  done(callback) {
    if (this.defer) {
      return this.defer.promise.then(callback)
    }

    return this._create_promise(() => {
      this.done(callback)
    })
  }

  _done() {
    const promise = this.defer.promise
    const resolve = this.defer.resolve
    this.defer    = null

    resolve()

    return promise
  }
}

Pending._pendings = {}

Pending.create = function( key, callback ) {
  const p = new Pending( callback )
  p.name  = key
  Pending._pendings[key] = p
  return p
}

Pending.get = function( key ) {
  return Pending._pendings[key]
}

Pending.getOrCreate = function( key, callback ) {
  return Pending.get(key) || Pending.create(key, callback)
}

Pending.start = function() {
  const keys = Array.prototype.slice.apply(arguments)

  return when.all(keys.map((key) => {
    const pending = Pending.get(key)
    if (pending) return pending.start()
  }))
}

module.exports = Object.assign(function exports(key, callback) {
  return Pending.getOrCreate(key, callback)
}, Pending)