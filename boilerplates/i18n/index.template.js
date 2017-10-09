'use strict'

module.exports = function() {

  this.after('application:setups', 'i18n:initialize', function() {
    this.config.i18n.default_locale = 'en'
    this.config.i18n.locales.push( 'en', 'fr' )
    this.config.i18n.load_path.push(
      this.root + '/config/locales'
    )
  })

  this.after('application:modules', 'i18n:module', function() {
    this.module( require('../workflow/modules/i18n.js') )
  })

}
