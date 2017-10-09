'use strict'

module.exports = function() {

  this.boilerplate( 'application_base' )
  this.boilerplate( 'assets' )

  this.configure.after('application:module', 'application:module:webpack', function() {
    this.module( require('../workflow/modules/webpack.js') )
  })

  this.configure.after('Wkfile', 'Wkfile:webpack', function() {
    wk.require('./workflow/webpack/tasks/webpack' , true)

    task('compile', [ 'webpack' ])
    task('build'  , [ 'webpack --compress' ])
    task('watch'  , [ 'webpack --watch' ])
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

    return JSON.stringify(pkg)
  })

}