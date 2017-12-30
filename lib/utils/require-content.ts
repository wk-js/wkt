const Module = module.constructor as any

export function requireContent(code:string, filename:string, context?:any) {

  const mod    = new Module(filename, module)
  mod.filename = filename
  mod.exports  = context
  mod.loaded   = true
  mod._compile( code, filename )

}