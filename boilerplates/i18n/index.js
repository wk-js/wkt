'use strict'

module.exports = {
  configure() {

    this.chunks.add('application:setup', function() {
      this.config.i18n.default_locale = 'en'
      this.config.i18n.locales.push( 'en', 'fr' )
      this.config.i18n.load_path.push(
        this.root + '/config/locales'
      )
    })

    this.chunks.add('application:module', function() {
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
