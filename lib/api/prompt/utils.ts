import * as when from 'when';

export function prompt( message:string, options?:any ) {

  return when.promise(function(resolve:Function) {
    options = Object.assign({
      empty: false
    }, options || {})

    process.stdin.resume()
    process.stdin.setEncoding( 'utf-8' )

    process.stdout.write( message + ' ' )

    function onData(data:any) {
      const str = data.toString().trim()

      if (str.length === 0 && !options.empty) {
        process.stdout.write( `Cannot be empty\n` )
        process.stdout.write( message + ' ' )
        return
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

  const defaultAnswer = options.hasOwnProperty('defaultAnswer') ? options.defaultAnswer : 'y'

  function answer(r:string) {
    const matches = (r.length==0?defaultAnswer:r).match(/^(y|yes|\n)$/i)
    if (matches && typeof options.callback === 'function') return options.callback()
    return !!matches
  }

  if (options.skip) return when(defaultAnswer).then(answer)
  return prompt(message + ` (y|yes|n|no) (Default: ${defaultAnswer})`, { empty: true }).then(answer)
}
