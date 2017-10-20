'use strict'

const Configure           = require('../configure')
const Pending             = require('../pending')
const { ask }             = require('../ask')
const Boilerplate         = require('../boilerplate')
const BoilerplateResolver = require('../boilerplate/resolver')
const ManagerPresenter    = require('./presenter')
const when                = require('when')
const Print               = require('../print')

class Manager {

  constructor( parameters ) {
    const bounds = [ 'config', 'mixin', '_p_boilerplate', '_p_create', '_p_ask' ]
    bounds.forEach(b => this[b] = this[b].bind(this))

    this.stack = new ManagerStack
    this.stack.add( 'setup', this._t_setup )

    this.boilerplates = new Configure

    Pending('create'     , this._p_create)
    Pending('ask'        , this._p_ask)
    Pending('boilerplate', this._p_boilerplate)
    Pending('boilerplate').autoexec = false

    parameters = Object.assign({
      output: '.'
    }, parameters || {})

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
      Print.debug( `Execute ${name}` )
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

  _p_boilerplate( pending ) {
    Print.exec(`Initialize ${pending.key.replace(process.cwd() + '/', '')}`)

    const promise = this._create_or_ask( pending.key, pending.optional )

    promise.then(Pending('boilerplate').next)

    return promise.then(b => {
      if (b && pending.reorder) this.boilerplates.reorder(b.get('name'), pending.reorder)
      return b
    })
  }

  _p_create( key ) {
    const promise = Boilerplate.create( key, ManagerPresenter(this) ).then((b) => {
      if (b) {
        b._call('create')
        this.boilerplates.add( b.get('name'), b )
        b._call('initialize')
      }

      return b
    })

    promise.then(Pending('create').next)

    return promise
  }

  _p_ask( key ) {
    const promise = ask(Print.ask.format(`Add ${Print.green(key)} module ? `), () => {
      return this._create_or_ask( key )
    })

    promise.then(Pending('ask').next)

    return promise
  }

  _create_or_ask( key, optional ) {
    if (optional) return Pending('ask').push(key)
    return Pending('create').push(key)
  }

  _t_setup() {
    const pending = Pending('boilerplate')
    return pending.start().then(() => {
      if (!pending.empty) this.t_setup()
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