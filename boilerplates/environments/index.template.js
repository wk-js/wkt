'use strict'

module.exports = function() {

  this.configure.after('application:module', 'application:module:environment', function() {
    this.module( require('../workflow/modules/environment.js') )
  })

}