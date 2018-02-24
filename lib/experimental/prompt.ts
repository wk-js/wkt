import { API, APIConstructor } from './api'
import { ask, prompt, choices } from '../api/prompt/utils'

export const PromptAPI = API.extend('prompt', {

  computed: {

    answers() : { [key:string]: any } {
      return this.shared_store('answers') ? this.shared_store('answers') : this.shared_store('answers', {})
    },

    questions() : { [key:string]: any } {
      return this.store('questions') ? this.store('questions') : this.store('questions', {})
    }

  },

  helpers() : any {
    return {
      ask:     this.ask,
      prompt:  this.prompt,
      answer:  this.answer,
      choices: this.choices
    }
  },

  methods: {

    ask( message:string, variable:string, options?:any ) {
      variable = variable || message
      this.questions[ variable ] = ask( message )
      this.questions[ variable ].then((answer:boolean) => this.answers[ variable as string ] = answer)
      return this.questions[ variable ]
    },

    prompt( message:string, variable:string, options?:any ) {
      variable = variable || message
      this.questions[ variable ] = prompt( message )
      this.questions[ variable ].then((answer:string) => this.answers[ variable as string ] = answer)
      return this.questions[ variable ]
    },

    choices( message:string, variable:string, list:string[], options?:any ) {
      variable = variable || message
      this.questions[ variable ] = choices( message, list, options )
      this.questions[ variable ].then((answer:string) => this.answers[ variable as string ] = answer)
      return this.questions[ variable ]
    },

    answer( variable:string ) {
      return this.answers[ variable ]
    }

  }

})