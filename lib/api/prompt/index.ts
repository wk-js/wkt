import { API } from "../index";
import * as when from 'when';
import { ask, prompt } from './utils'

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
        if (question.action === 'prompt') promise = prompt( question.message, question.options )

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

  prompt( message:string, variable:string, options?:any ) {
    this.questions.push({ message, variable, options, action: 'prompt' })
  }

  answer( variable:string ) {
    return this.answers[ variable ]
  }

}