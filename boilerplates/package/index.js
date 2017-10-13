'use strict'

module.exports = function() {

  this.chunk.after('application:module', 'application:module:package', function() {
    this.module( require('../workflow/modules/package.js') )
  })

  // this.chunk.after('Wkfile', 'Wkfile:package', function() {
  //   wk.require('bump', true)
  // })

}