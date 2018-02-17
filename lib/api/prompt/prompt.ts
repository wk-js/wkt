import { API } from "../api";
import * as when from 'when';
import { ask, prompt, choices } from './utils'

export class PromptAPI extends API {

  get answers() : { [key:string]: any } {
    return this.shared_store('answers') ? this.shared_store('answers') : this.shared_store('answers', {})
  }

  get questions() : { [key:string]: any } {
    return this.store('questions') ? this.store('questions') : this.store('questions', {})
  }

  init() {}

  bundle() {}

  helpers() {
    return {
      ask: this.ask,
      prompt: this.prompt,
      answer: this.answer,
      choices: this.choices
    }
  }

  ask( message:string, variable:string, options?:any ) {
    variable = variable || message
    this.questions[ variable ] = ask( message )
    this.questions[ variable ].then((answer:boolean) => this.answers[ variable as string ] = answer)
    return this.questions[ variable ]
  }

  prompt( message:string, variable:string, options?:any ) {
    variable = variable || message
    this.questions[ variable ] = prompt( message )
    this.questions[ variable ].then((answer:string) => this.answers[ variable as string ] = answer)
    return this.questions[ variable ]
  }

  choices( message:string, variable:string, list:string[], options?:any ) {
    variable = variable || message
    this.questions[ variable ] = choices( message, list, options )
    this.questions[ variable ].then((answer:string) => this.answers[ variable as string ] = answer)
    return this.questions[ variable ]
  }

  // chain( message:string, variable:string, list:{ [key:string]:any }, options?:any ) {
  //   const keys = Object.keys( list )
  //   return this.choices(message, variable, keys).then((answer:string) => {
  //     if (list.hasOwnProperty(answer)) {
  //       const method = list[answer].method as Function
  //       return method.apply(this, list[answer].parameters)
  //     }
  //   })
  // }

  answer( variable:string ) {
    return this.answers[ variable ]
  }

}