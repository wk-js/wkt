'use strict'

module.exports = {

  name: 'environments',

  dependencies() {},

  configure() {

    this.chunks.add('application:module:environments', function() {
      this.module( require('../workflow/modules/environment.js') )
    })

  }
}