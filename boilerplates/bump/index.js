'use strict'

module.exports = {
  configure() {

    this.chunks.add('application:module', function() {
      this.module( require('../workflow/modules/bump.js') )
    })

    this.chunks.after('Wkfile', function() {
      wk.require('bump', true)
    })

  }
}