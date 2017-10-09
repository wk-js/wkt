'use strict'

module.exports = function() {

  this.boilerplate( 'application_base' )

  this.configure.after('application:module', 'application:module:package', function() {
    this.module( require('../workflow/modules/package.js') )
  })

}