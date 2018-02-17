import { API } from "../api";
import { spawn } from "child_process";
import { reduce } from 'when'
import { Subprocess } from "./subprocess";

export class ExecAPI extends API {

  subprocesses:Subprocess[] = []

  init() {}

  bundle() {
    const subprocesses = this.subprocesses.map((sub) => {
      return () => sub.execute()
    })

    return reduce( subprocesses, (res:null, action:Function) => action(), null ).then(() => this.subprocesses = [])
  }

  helpers() {
    return {
      exec: this.exec,
      execSync: this.execSync
    }
  }

  exec(command:string, options?:any) {
    options       = options || {}
    options.async = true
    options.cwd   = this.boilerplate.output

    const sub = Subprocess.create(command, options)
    this.subprocesses.push( sub )
    return sub.promise
  }

  execSync(command:string, options?:any) {
    options       = options || {}
    options.async = false
    options.cwd   = this.boilerplate.output

    return Subprocess.execute(command, options)
  }

}