import { API, APIConstructor } from './api'
import { Boilerplate } from '..';
import { Subprocess } from '../api/exec/subprocess';

export const ExecAPI = API.extend('exec', {

  helpers() : any {
    return {
      exec: this.exec,
      execSync: this.execSync
    }
  },

  methods: {

    exec(command:string, options?:any) {
      options       = options || {}
      options.async = true
      options.cwd   = (<Boilerplate>this.boilerplate).dst_path

      return Subprocess.execute(command, options)
    },

    execSync(command:string, options?:any) {
      options       = options || {}
      options.async = false
      options.cwd   = (<Boilerplate>this.boilerplate).dst_path

      return Subprocess.execute(command, options)
    }

  }

})