'use strict'

const Chunks  = require('../../chunks')
const Print   = require('../../print')
const Pending = require('../../pending')
const _       = require('lol/utils/array')

module.exports = {

  initialize() {
    this.chunks = new Chunks
    this.chunks.autocreate = true
    this.manager.config('chunks', this.chunks)

    this.manager.config('files', {})

    this.manager.config('skip_ask', true)

    // Override ask
    Pending('ask_boilerplate').callback = this._p_ask

    this.manager.stack.add( 'list' , this.t_list )
    this.manager.stack.add( 'clean', this.t_clean)

    this.manager.mixin(require('../renderer/file_mixin'))

    // Update Print configuration
    Print.config.visibility( 'exec', false )

    // Remove itself
    this.manager.workflow( this )
  },

  methods: {

    /**
     * Override ask
     *
     */
    _p_ask( key ) {
      this.manager.add( key )
      Pending('ask_boilerplate').next()
    },

    /**
     * Tasks
     *
     * @returns
     */
    t_list() {
      const bps = _.sort(this.manager.boilerplates.order)
      Print.debug('Boilerplates available:\n' + Print.green(bps.join('\n')))
    },

    t_clean() {
      return this.manager.boilerplates.execute( this, (bp) => {
        return bp.call('clean')
      })
    }

  }

}