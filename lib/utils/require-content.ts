export function requireContent(content:string, path:string, parent:any, xprts:any) {

  const Module = module.constructor as any
  const mod = new Module(path, parent)
  mod.filename = path
  mod.exports = xprts
  mod.loaded = true
  mod._compile( content, path )

}