'use strict'

const when = require('when')

function emit(listeners) {
  const _listeners = listeners.slice(0)

  for (let i = 0, ilen = _listeners.length; i < ilen; i++) {
    if (_listeners[i]) _listeners[i]()
  }
}

function on(listeners, callback) {
  listeners.push( callback )
}

function off(listeners, callback) {
  listeners.splice(listeners.indexOf(callback), 1)
}

function once(listeners, callback) {
  on(listeners, function() {
    callback()
    off( listeners, callback )
  })
}

class Pending {

  constructor( callback ) {
    this.next = this.next.bind(this)
    this.push = this.push.bind(this)
    this.done = this.done.bind(this)

    this.process  = false
    this.promises = []
    this.callback = callback
    this.listeners = { done: [] }
  }

  get active() {
    return this.promises.length != 0 && this.process
  }

  next() {
    this.process = false
    const promise = this.promises.shift()
    if (!promise) return this.done()
    this.process = true
    promise.resolve( this.callback.apply(null, promise.args) )
  }

  push() {
    const args = arguments
    return when.promise((resolve, reject) => {
      this.promises.push({ resolve, reject, args: Array.prototype.slice.apply(args) })
      if (!this.process) this.next()
    })
  }

  done(callback) {
    if (callback) {
      return when.promise((resolve) => {
        once(this.listeners['done'], resolve)
      }).then(callback)
    }

    emit( this.listeners['done'] )
  }
}

Pending._pendings = {}

Pending.create = function( key, callback ) {
  const p = new Pending( callback )
  Pending._pendings[key] = p
  return p
}

Pending.get = function( key ) {
  return Pending._pendings[key]
}

Pending.getOrCreate = function( key, callback ) {
  return Pending.get(key) || Pending.create(key, callback)
}

Pending.done = function() {
  return when.promise((resolve) => {
    const keys = Array.prototype.slice.apply(arguments)
    let i      = 0

    keys.forEach((key) => {
      Pending.get(key).done(() => {
        i++
        if (i === keys.length) resolve()
      })
    })
  })
}

module.exports = Object.assign(function exports(key, callback) {
  return Pending.getOrCreate(key, callback)
}, Pending)