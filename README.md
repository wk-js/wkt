# Wkt

```
wkt <input=string default="./template.js"> <output=string default="./">
```

## Example

See examples [here](https://github.com/wk-js/wkt-web)

## API

### `boilerplate`

```ts
// Scope value is optional. It accepts "local" or "root" scope.
// Access to the boilerplate stack
stack(scope?:string='local') => Configure;
stack(scope?:string='local').add(key:string, callback?:Function)
stack(scope?:string='local').before(before:string, key?:string, callback?:Function)
stack(scope?:string='local').after(after:string, key?:string, callback?:Function)
stack(scope?:string='local').first(key:string, callback?:Function)
stack(scope?:string='local').last(key:string, callback?:Function)
```

```ts
// Scope value is optional. It accepts "local" or "root" scope.
// APIs methods from local boilerplate
// By defaults every methods of the local template are global.
api(scope?:string='local') => { [key:string]: Function };
```

```ts
// Scope value is optional. It accepts "local" or "root" scope.
// APIs methods from local boilerplate
// By defaults every methods of the local template are global.
store(scope:string='local') => { get: (key:string) => any, set: (key:string, value:any) => any };
store(scope:string='local').get(key:string) => any
store(scope:string='local').set(key:string, value:any) => any
```

```ts
// Get or set the root boilerplate destination path
output(str?: string | undefined) => string;
```

Example
```js
stack().add('hello', function() {
  store().set('message', 'Hello World')
})

stack().after('hello', function() {
  console.log( store.get('message') )
})

stack().after('bundle', function() {
  console.log('after bundle')
})

stack().before('bundle', function() {
  console.log('before bundle')
})

stack('root').before('bundle', function() {
  console.log('before root bundle')
})

stack('root').after('bundle', function() {
  console.log('after root bundle')
})

// => before root bundle
// => before bundle
// => after bundle
// => Hello World
// => after root bundle
```

### `file`

By default, every files and directory relative to `template.js` are copied to the destination directory.

```ts
// Add a file/glob pattern to the destination tree
addFile(glob:string, parameters?:AssetItemRules);
```

```ts
// Ignore a file/glob pattern to the destination tree
ignoreFile(glob: string);
```

```ts
// Add a directory/glob pattern to the destination tree
addDirectory(glob:string, parameters?:AssetItemRules);
```

```ts
// Ignore a directory/glob pattern to the destination tree
ignoreDirectory(glob: string);
```

```ts
// Edit a file. Callback can return a string/buffer or a promise
editFile(glob: string, callback: (value: Buffer) => string|Buffer);
```

Example

```js
addFile('**/*')
ignore('template.js')

editFile('package.json', function(content) {
  const json = JSON.parse(content.toString('utf-8'))

  Object.assign(json.dependencies, {
    "asset-pipeline": "github:wk-js/asset-pipeline#1.0.0"
  })

  return JSON.stringify(json, null, 2)
})
```

#### Templating

```ts
// Add file/glob pattern as a template
templateFile(glob: string, template?: object | boolean);
```

```ts
// Pass data to the templae renderer
templateData(data:object, options?: TemplateOptions);
```

```ts
/**
 * Works like Configure.
 *
 * See https://github.com/wk-js/wkt/blob/master/lib/api/template/chunk_stack.ts
 */
chunk().add(key: string, chunk: string) => void;
chunk().before(bfore: string, key?: string, chunk?: string) => void;
chunk().after(after: string, key?: string, chunk?: string) => void;
chunk().first(key: string, chunk: string) => void;
chunk().last(key: string, chunk: string) => void;
```

**Example :** Chunk are useful to group data togethers

```ts
chunk().add('hello:buddy:john', 'Hello John')
chunk().add('hello:buddy:marc', 'Hello Marc')
chunk().before('hello:buddy:john', 'hello:world', 'Hello World')

console.log( chunk().get('hello:buddy') )
// =>
// Hello John
// Hello Marc

console.log( chunk().get('hello') )
// =>
// Hello World
// Hello John
// Hello Marc

console.log( chunk().order )
// => [ 'hello:world', 'hello:buddy:john', 'hello:buddy:marc' ]
```

**Example :** Template file

```txt
{%= chunk('hello:buddy') %}
```

### `macro`

```ts
// Get or create a macro
macro(key: string, ...args: any[]);
```

Example
```js
macro().set('hello', function() {
  console.log('Hello World')
})

macro('hello') // => Hello World

macro().set('hello', function(name) {
  name = name || 'World'
  console.log('Hello ' + name)
})

macro('hello', 'John') // => Hello John
```

### `exec`

```ts
// Execute a command asynchronously. Return a promise
exec(command: string, options?:any) : Promise
```

```ts
// Execute a command synchronously. Return process result
execSync(command: string, options?:any) : ProcessResult
```

Same options as `spawn()`, plus some shortcuts

```js
{
  interactive: true,    // Set stdio to inherit
  printStdout: true,    // Print stdout
  printStderr: true,    // Print stderr
  rejectOnError: false  // Reject the promise on error
}
```

Example
```js
execSync('pwd')
```

More precision [here](https://github.com/wk-js/wkt/blob/master/lib/stack)

### `prompt`

```ts
// Ask a question. Answer yes or no.
ask(message: string, variable: string, options?: any) => Promise<boolean>;
```

```ts
// Ask a question. Answer anything.
prompt(message: string, variable: string, options?: any) => Promise<string>;
```

```ts
// Ask a question. Answer limited to a list of answsers.
choices(message: string, variable: string, list:string[], options?: any) => Promise<string>;
```

```ts
// Get the answer
answer(variable: string) => string | boolean;
```

Example

```js
stack().before('bundle', 'prompt', function() {
  return prompt('Project name:', 'project_name')
})

stack().after('bundle', 'prompt', function() {
  output(output() + '/' + answer('project_name'))
})
```

### `source`

Load another boilerplate

Example

```js
---
name: my_boilerplate
sources:
  - github:wk-js/wkt-webt // An url or a repository or a repository with a branch/tag
optionalsSources:
  - ./skeleton/template.js
  - assets/template.js
  - bump
  - git
  - webpack
---
stack().after('bundle', function() {
  execSync('npm install')
  removeFile('template.js')
})
```

### `api`

Import custom api function

Example

```js
---
apis:
  - github:wk-js/wkt-api // An url or a repository or a repository with a branch/tag
optionalsApis:
  - my_custom_api.js // Or a file
---
```