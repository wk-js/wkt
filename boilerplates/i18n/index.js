'use strict'

module.exports = {
  configure() {

    this.chunk('application:setup').add('application:setup:i18n', function() {
      this.config.i18n.default_locale = 'en'
      this.config.i18n.locales.push( 'en', 'fr' )
      this.config.i18n.load_path.push(
        this.root + '/config/locales'
      )
    })

    this.chunk('application:module').add('application:module:i18n', function() {
      this.module( require('../workflow/modules/i18n.js') )
    })

    this.file('package.json', function(content) {

      const pkg = JSON.parse(content)

      pkg.dependencies = Object.assign(pkg.dependencies, {
        "lol": "github:makemepulse/lol.js#0.0.4"
      })

      return JSON.stringify(pkg, null, 2)

    })

  }
}
