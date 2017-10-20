'use strict'

const Chunks  = require('../chunks')
const Print   = require('../print')
const Pending = require('../pending')

module.exports = {

  initialize() {
    this.chunks = new Chunks
    this.chunks.autocreate = true
    this.manager.config('chunks', this.chunks)

    this.manager.config('files', {})

    // Override ask
    Pending('ask').callback = this._p_ask

    this.manager.stack.add( 'list' , this.t_list )
    this.manager.stack.add( 'clean', this.t_clean)

    // Remove itself
    this.manager.boilerplates.order.splice(
      this.manager.boilerplates.order.indexOf(this.name),
      1
    )
  },

  methods: {

    /**
     * Override ask
     *
     */
    _p_ask( key ) {
      this.manager.add( key )
      Pending('ask').next()
    },

    /**
     * Tasks
     *
     * @returns
     */
    t_list() {
      Print.debug('Boilerplates available:\n', Print.green(this.manager.boilerplates.order.join('\n')))
    },

    t_clean() {
      return this.manager.boilerplates.execute( this, (bp) => {
        return bp.call('clean')
      })
    }

  }

}