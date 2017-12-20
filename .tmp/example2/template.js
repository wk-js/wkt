'use strict'

//api('stack')
//api('template')
//api('file')
//api('prompt')

before('prompt', function() {
  prompt('What is your name ?', 'name')
})

rename( 'example.js', 'test.js' )

chunk('some code', `
var test = "test";
console.log( test )
`)

after('bundle', function() {
  template('test.js', {
    data: { name: answer('name') }
  })
})
