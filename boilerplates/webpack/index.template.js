'use strict'

module.exports = function() {

  this.after('application:modules', 'webpack:module', function() {
    this.module( require('../workflow/modules/webpack.js') )
  })

  this.after('Wkfile', 'Wkfile:webpack', function() {

    wk.require('./workflow/webpack/tasks/webpack' , true)

    task('compile', [ 'webpack' ])
    task('build'  , [ 'webpack --compress' ])
    task('watch'  , [ 'webpack --watch' ])

  })

}