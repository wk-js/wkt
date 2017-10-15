'use strict'

module.exports = {
  configure() {

    this.chunk('application:module').add('application:module:git', function() {
      this.module( require('../workflow/modules/git.js') )
    })

  }
}