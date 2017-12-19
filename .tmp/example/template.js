'use strict'

//api( 'file' )
//api( 'stack' )

stack().insertAfter('bundle', function() {
  remove( 'template.js' )
})