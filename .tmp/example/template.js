'use strict'

macro('hello').create(function() {
  console.log('Hello World')
  return 'Salut ! Ça va ?'
})

rename( 'content/plouf.js', 'content/mdr.js' )
remove( 'template.js' )

this.stack().insertAfter('bundle', function() {
  // copy( 'content/lol2.js' )
})