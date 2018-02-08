import * as when from 'when';

export function prompt( message:string, options?:any ) {

  options = Object.assign({
    empty: false
  }, options || {})

  if (options.hasOwnProperty('defaultAnswer')) {
    message       = `${message} (Default: ${options.defaultAnswer})`
    options.empty = true
  }

  return when.promise(function(resolve:Function) {
    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message + ' ' )

    function onData(data:any) {
      let str = data.toString().trim()

      if (str.length === 0) {
        if (options.empty) {
          str = options.defaultAnswer
        } else {
          process.stdout.write( `Cannot be empty\n` )
          process.stdout.write( message + ' ' )
          return
        }
      }

      process.stdin.removeListener( "data", onData )
      resolve( str )
      process.stdin.pause()
    }

    process.stdin.on("data", onData)
  })

}

export function ask( message:string, options?:any ) {
  options = typeof options === 'object' ? options : {}

  options.defaultAnswer = 'y'
  options.empty         = true

  return choices( message, ['y', 'yes', 'n', 'no'], options )
  .then((answer:string) => !!answer.match(/^(y|yes)$/i))
}

export function choices( message:string, answers:string[], options?:any ) {
  message = `${message} [${answers.join('|')}]`

  return prompt(message, options)
  .then((answer:string) => {
    if (answers.indexOf(answer) === -1) {
      process.stdout.write( `"${answer}" is an invalid answer\n` )
      return prompt(message, options)
    }

    return answer
  })
}
