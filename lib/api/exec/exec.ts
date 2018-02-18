import { API } from "../api";
import { spawn } from "child_process";
import { reduce } from 'when'
import { Subprocess } from "./subprocess";

export class ExecAPI extends API {

  init() {}

  bundle() {}

  helpers() {
    return {
      exec: this.exec,
      execSync: this.execSync
    }
  }

  exec(command:string, options?:any) {
    options       = options || {}
    options.async = true
    options.cwd   = this.boilerplate.dst_path

    return Subprocess.execute(command, options)
  }

  execSync(command:string, options?:any) {
    options       = options || {}
    options.async = false
    options.cwd   = this.boilerplate.dst_path

    return Subprocess.execute(command, options)
  }

}