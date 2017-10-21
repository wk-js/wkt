'use strict'

const Resolver        = require('./resolver')
const { basename }    = require('path')
const { isGenerator } = require('../utils/generator')
const generator       = require('when/generator')

function call(action, context, args) {
  return isGenerator(action) ? generator.apply(action, args) : action.apply( context, args )
}

class Boilerplate {

  constructor( presenter, __boilerplate ) {
    this.presenter     = presenter
    this.__boilerplate = __boilerplate
  }

  call() {
    const args = Array.prototype.slice.apply(arguments)
    const action = this.presenter[args.shift()]
    if (action) return call( action, this.presenter, args )
  }

  get(key) {
    return this.presenter[key]
  }

  set(key, value) {
    Object.defineProperty(this.presenter, key, {
      enumerable: true,
      get() { return value }
    })
  }

  _call() {
    const args   = Array.prototype.slice.apply(arguments)
    const action = this.__boilerplate[args.shift()]
    if (action) return call( action, this.presenter, args )
  }

}

Boilerplate.create = function( pathOrRepo, presenter ) {
  return Resolver.resolve( pathOrRepo )

  .then((path) => {
    const __boilerplate = require( path )

    presenter.path = path
    presenter.name = __boilerplate.name || basename(path)

    for (const key in __boilerplate.methods) {
      presenter[key] = __boilerplate.methods[key].bind(presenter)
    }

    return new Boilerplate( presenter, __boilerplate )
  })
}

module.exports = Boilerplate