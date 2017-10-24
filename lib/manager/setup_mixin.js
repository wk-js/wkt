'use strict'

const Pending          = require('../pending')
const Print            = require('../print')
const Boilerplate      = require('../boilerplate')
const ManagerPresenter = require('./presenter')
const { ask }          = require('../ask')

module.exports = {

  _setup_boilerplate( pending ) {
    Print.exec(`Initialize ${pending.key.replace(process.cwd() + '/', '')}`)

    const promise = this._setup_create_or_ask( pending.key, pending.optional )

    promise.then(Pending('boilerplate').next)

    return promise.then(b => {
      if (b && pending.reorder) this.boilerplates.reorder(b.get('name'), pending.reorder)
      return b
    })
  },

  _setup_create( key ) {
    const promise = Boilerplate.create( key, ManagerPresenter(this) ).then((b) => {
      if (b) {
        b._call('create')
        this.boilerplates.add( b.get('name'), b )
        b._call('initialize')
      }

      return b
    })

    promise.then(Pending('create_boilerplate').next)

    return promise
  },

  _setup_ask( key ) {
    const message = Print.ask.format(`Add ${Print.green(key)} module ? `)
    const promise = ask(message, () => {
      return this._setup_create_or_ask( key )
    })

    promise.then(Pending('ask_boilerplate').next)

    return promise
  },

  _setup_create_or_ask( key, optional ) {
    if (optional) return Pending('ask_boilerplate').push(key)
    return Pending('create_boilerplate').push(key)
  }

}