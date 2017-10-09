'use strict'

module.exports = function() {

  this.configure.after('application:module', 'application:module:git', function() {
    this.module( require('../workflow/modules/git.js') )
  })

}