'use strict'

module.exports = function() {

  this.boilerplate( 'application_base' )

  this.configure.after('application:module', 'application:module:git', function() {
    this.module( require('../workflow/modules/git.js') )
  })

}