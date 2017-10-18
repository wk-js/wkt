'use strict'

module.exports = {
  configure() {

    this.chunks.add('application:module', function() {
      this.module( require('../workflow/modules/webpack.js') )
    })

    this.chunks.after('Wkfile', 'Wkfile:webpack', function() {
      wk.require('./workflow/webpack/tasks/webpack', true)

      task('compile', [ 'assets:move', 'webpack' ])
      task('watch'  , [ 'assets:move', 'webpack --watch' ])
      task('server' , [ 'assets:move', 'webpack --server' ])
      task('start'  , [ 'server' ])

      namespace('build', function() {
        task('default'  , [ 'assets:move', 'webpack --compress' ])

        task('locales', [ 'assets:resolve' ], { async: true }, function() {
          const ENV  = global.Application.config.environment
          const I18n = global.Application.config.i18n

          const commands = I18n.locales.map(function(locale) {
            return {
              command: `NODE_ENV=${ENV} I18N_LOCALE=${locale} npm run build`
            }
          })

          // Build shared assets
          commands.push({
            command: `NODE_ENV=${ENV} I18N_LOCALE=${I18n.default_locale} SHARED=true npm run build`
          })

          wk.exec(commands)
          .then(this.complete)
          .catch(this.fail)
        })
      })
    })

    this.file('package.json', function(content) {
      const pkg = JSON.parse(content)

      pkg.dependencies = Object.assign(pkg.dependencies, {
        "webpack": "2.7.0",
        "webpack-dev-server": "2.8.2",
        "raw-loader": "0.5.1",
        "stylus": "0.54.5",
        "stylus-loader": "2.5.1",
        "extract-text-webpack-plugin": "2.1.2",
        "babel-core": "6.22.1",
        "babel-loader": "6.2.10",
        "babel-preset-es2015": "6.22.0"
      })

      return JSON.stringify(pkg, null, 2)
    })

  }
}