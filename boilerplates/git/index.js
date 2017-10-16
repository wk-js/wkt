'use strict'

module.exports = {
  configure() {

    this.chunks.add('application:module', function() {
      this.module( require('../workflow/modules/git.js') )
    })

  }
}