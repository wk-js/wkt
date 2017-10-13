'use strict'

module.exports = function() {

  this.chunk.after('application:setup', 'application:setup:assets', function() {

    this.assets.LOAD_PATH          = './app'
    this.assets.DST_PATH           = './public'
    this.assets.KEEP_MANIFEST_FILE = true
    this.assets.cacheable          = false
    this.assets.debug              = true

  })

  this.chunk.after('application:module', 'application:module:assets', function() {
    this.module( require('../workflow/modules/assets.js') )
  })

  this.chunk.after('Wkfile', 'Wkfile:assets', function() {
    wk.require('assets'  , true)
  })

  this.chunk.file('package.json', function(content) {
    const pkg = JSON.parse(content)

    pkg.dependencies = Object.assign(pkg.dependencies, {
      "asset-pipeline": "github:wk-js/asset-pipeline#0.0.2"
    })

    return JSON.stringify(pkg)
  })

}