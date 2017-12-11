'use strict'

const Configure           = require('../configure')
const Pending             = require('../pending')
const { ask }             = require('../ask')
const BoilerplateResolver = require('../boilerplate/resolver')
const when                = require('when')
const Print               = require('../print')
const SetupMixin          = require('./setup_mixin')
const DefaultConfig       = require('../config')

class Manager {

  constructor( parameters ) {
    Object.assign(this, SetupMixin)

    const bounds = [
      'config',
      'mixin',
      'ask',

      '_ask',
      '_t_setup',

      '_setup_create_or_ask',
      '_setup_boilerplate',
      '_setup_create',
      '_setup_ask'
    ]
    bounds.forEach(b => this[b] = this[b].bind(this))

    this.stack = new ManagerStack
    this.stack.add( 'setup', this._t_setup )

    Pending('create_boilerplate', this._setup_create)
    Pending('ask_boilerplate'   , this._setup_ask)

    Pending('boilerplate', this._setup_boilerplate)
    Pending('boilerplate').autoexec = false

    Pending('ask', this._ask)
    Pending('ask').autoexec = false

    this.boilerplates = new Configure

    parameters = Object.assign({}, DefaultConfig, parameters || {})

    this._config = { parameters }
    this._mixins = []
  }

  add(key, optional, reorder) {
    return Pending('boilerplate').push({ key, optional, reorder })
  }

  before(before, key, optional) {
    return this.add( key, optional, before )
  }

  after(after, key, optional) {
    return this.add( key, optional, after )
  }

  execute() {
    this.stack.execute( this, (actions, name) => {
      Print.exec( `Execute ${name}` )
      return when.reduce(actions, (r, action) => action(), null)
    })
  }

  config(key, value) {
    if (arguments.length == 2) {
      this._config[key] = value
      this.boilerplates.execute( null, (b) => {
        b.set( key, value )
      })
    }

    return this._config[key]
  }

  mixin(value) {
    this._mixins.push( value )
  }

  source(sources) {
    Object.assign(BoilerplateResolver.sources, sources)
  }

  workflow( boilerplate ) {
    const index = this.boilerplates.order.indexOf(boilerplate.name)
    if (index === -1) return

    this.boilerplates.order.splice( index, 1 )
  }

  ask(message, callback) {
    if (this._config.parameters.skip_ask) {
      return when.promise((resolve) => {
        if (callback) return resolve(callback())
        resolve(true)
      })
    }

    return Pending('ask').push({ message, callback })
  }

  _ask(o) {
    const promise = ask(Print.ask.format(o.message), o.callback)

    promise.then(Pending('ask').next)

    return promise
  }

  _t_setup() {
    return Pending('ask')
    .start()
    .then(Pending('boilerplate').start)
    .then(() => {
      if (!Pending('ask').empty) return Pending('ask').start()
    })
    .then(() => {
      if (!Pending('boilerplate').empty) this._t_setup()
    })
  }

}

class ManagerStack extends Configure {

  add(key, action) {
    if (!this.tasks.hasOwnProperty(key)) this.order.push( key )
    this.tasks[key] = this.tasks[key] || []
    this.tasks[key].push( action || this._noop )
  }

  _noop() {}

}

module.exports = Manager