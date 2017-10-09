'use strict'

module.exports = function Application() {

  this.configure.add('application:initialize', function() {

    <%= CHUNKS['application:setup'].join('\n\n') %>

  })

  <%= CHUNKS['application:module'].join('\n') %>

}