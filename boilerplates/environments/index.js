'use strict'

module.exports = {

  name: 'environments',

  dependencies() {},

  configure() {

    this.chunks.add('application:module', function() {
      this.module( require('../workflow/modules/environment.js') )
    })

  }
}