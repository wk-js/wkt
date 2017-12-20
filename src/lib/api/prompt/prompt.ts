import { API } from "../../index";
import * as when from 'when';

function prompt( message:string, options?:any ) {

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

function ask( message:string, options?:any ) {
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

export class PromptAPI extends API {

  answers:any = {}

  get questions() : any[] {
    return this.store('questions') ? this.store('questions') : this.store('questions', [])
  }

  init() {
    this.boilerplate.stack.before('bundle', 'prompt')
  }

  bundle() {
    const tasks = this.questions.map((question:any) => {
      return () => {
        let promise

        if (question.action === 'ask')    promise = ask( question.message, question.options )
        if (question.action === 'prompt') promise = prompt( question.message )

        return promise.then((value:any) => {
          this.answers[ question.variable ] = value
        })
      }
    })

    return when.reduce(tasks, (res:null, action:Function) => action(), null)
  }

  helpers() {
    return {
      ask: this.ask,
      prompt: this.prompt,
      answer: this.answer
    }
  }

  ask( message:string, variable:string, options?:any ) {
    this.questions.push({ message, variable, options, action: 'ask' })
  }

  prompt( message:string, variable:string ) {
    this.questions.push({ message, variable, action: 'prompt' })
  }

  answer( variable:string ) {
    return this.answers[ variable ]
  }

}