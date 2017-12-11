'use strict'

const when = require('when')

function prompt( message ) {

  return when.promise(function(resolve) {

    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message )

    process.stdin.once("data", function (data) {
      resolve( data.toString().trim() )
      process.stdin.pause()
    })

  })

}

function ask( message, options ) {
  options = typeof options === 'object' ? options : {}

  const defaultAnswer = options.hasOwnProperty('defaultAnswer') ? options.defaultAnswer : 'y'

  function answer(r) {
    const matches = (r.length==0?defaultAnswer:r).match(/^(y|yes|\n)$/i)
    if (matches && typeof options.callback === 'function') return options.callback()
    return !!matches
  }

  if (options.skip) return when(defaultAnswer).then(answer)
  return prompt(message).then(answer)
}


function input( message ) {
  return when.promise(function(resolve) {

    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message )

    process.stdin.once("data", function (data) {
      resolve( data.toString().trim() )
      process.stdin.pause()
    })

  })
}

module.exports = {
  prompt,
  input,
  ask
}