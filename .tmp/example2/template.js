'use strict'

//api('stack')
//api('file')
//api('prompt')

before('prompt', function() {
  prompt('What is your name ?', 'name')
  ask('Are you a boy ?', 'is_boy')
})

after('bundle', function() {
  console.log( `Your name is ${answer('name')}. You are a boy : ${answer('is_boy')}` )
  rename( 'example.js', 'test.js' )
})