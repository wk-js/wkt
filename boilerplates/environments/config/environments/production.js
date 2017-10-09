'use strict'

module.exports = function Production() {

  // Inherit staging configuration
  require('./staging').call( this, this )

  // Override staging configuration
  this.assets.ASSET_KEY = "<asset_key>"

}