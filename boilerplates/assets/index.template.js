'use strict'

module.exports = function() {

  this.after('application:setups', 'assets:initialize', function() {

    this.assets.LOAD_PATH          = './app'
    this.assets.DST_PATH           = './public'
    this.assets.KEEP_MANIFEST_FILE = true
    this.assets.cacheable          = false
    this.assets.debug              = true

  })

  this.after('application:modules', 'assets:module', function() {
    this.module( require('../workflow/modules/assets.js') )
  })

  this.after('Wkfile', 'Wkfile:assets', function() {
    wk.require('assets'  , true)
  })

}