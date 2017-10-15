'use strict'

module.exports = function Application() {

  this.configure.add('application:initialize', function() {

    <%= chunk('application:setup').join('\n\n') %>

  })

  <%= chunk('application:module').join('\n') %>

}