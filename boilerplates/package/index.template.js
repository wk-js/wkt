'use strict'

module.exports = function() {

  this.after('application:modules', 'package:module', function() {
    this.module( require('../workflow/modules/package.js') )
  })

}