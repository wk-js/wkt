'use strict'

module.exports = function Application() {

  this.configure.add('application:initialize', function() {

    <%= CHUNKS['application:setups'].join('\n\n') %>

  })

  <%= CHUNKS['application:modules'].join('\n') %>

}