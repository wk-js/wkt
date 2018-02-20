import { Boilerplate } from "..";
import { requireContent } from "../utils/require-content";
import { P } from "../print";
import { ask } from "../api/prompt/utils";
import when from 'when'

export function parse( boilerplate:Boilerplate, content:string, throwOnError:boolean = true ) {
  let code = "var helpers = this;\n"

  const api = boilerplate.api.helpers

  for (const key in api) {
    code += `function ${key}() { return helpers.${key}.apply(null, arguments); }\n`
  }

  code += `\n${content}`

  try {
    requireContent(code, process.cwd() + '/' + boilerplate.path, api)
  } catch(e) {
    if (throwOnError) throw e
  }
}

export function get_imports(key:string, content:string, path:string) {
  const line_regex = new RegExp(`\/\/@${key}(\\?)?=.+`, 'g')
  const str_regex  = new RegExp(`\/\/@${key}(\\?)?=`, 'g')
  const optional_regex = new RegExp(`\/\/@${key}\\?=`, 'g')

  const lines = content.match( line_regex ) || []

  return when.reduce<string[]>(lines, (reducer:string[], line:string) => {
    const result = line.replace(str_regex, '').trim()

    if (line.match(optional_regex)) {
      return ask(P.grey(`${P.green('[wkt]')} Do you want to resolve ${P.green(result)} ?`))
      .then(function(confirm) {
        if (confirm) reducer.push( result )
        return reducer
      })
    }

    reducer.push( result )
    return reducer
  }, [])

  .then(function(lines:string[]) {
    return lines.filter((line:string) => !line ? false : (line.length > 0))
  })
}

export function fetch_optionals(paths:string[], optionals:string[]) {
  return when.reduce(optionals, (r:string[], optional:string) => {
    return ask(P.grey(`${P.green('[wkt]')} Do you want to resolve ${P.green(optional)} ?`))
    .then(function(confirm) {
      if (confirm) r.push( optional )
      return r
    })
  }, paths)
}