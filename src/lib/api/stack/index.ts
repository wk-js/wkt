import { API } from "../index";
import { Configure } from "../../stack/configure";

export class StackAPI extends API {

  bundle() {}

  helpers() {
    return {
      stack: this.stack
    }
  }

  stack() : Configure {
    return this.boilerplate.stack
  }

}