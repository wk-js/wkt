'use strict'

module.exports = function() {

  this.after('application:modules', 'environment:module', function() {
    this.module( require('../workflow/modules/environment.js') )
  })

}