'use strict'

module.exports = function() {

  this.chunk.after('application:module', 'application:module:git', function() {
    this.module( require('../workflow/modules/git.js') )
  })

}