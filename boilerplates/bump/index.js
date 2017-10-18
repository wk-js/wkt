'use strict'

module.exports = {
  configure() {

    this.chunks.add('application:module:bump', function() {
      this.module( require('../workflow/modules/package.js') )
    })

    this.chunks.add('Wkfile:bump', function() {
      wk.require('bump', true)
    })

  }
}