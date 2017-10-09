'use strict'

module.exports = function() {

  this.configure.after('application:module', 'application:module:package', function() {
    this.module( require('../workflow/modules/package.js') )
  })

}