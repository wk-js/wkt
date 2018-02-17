# Wkt

```
wkt <input=string default="./template.js"> <output=string default="./">
```

## Example

See examples [here](https://github.com/wk-js/wkt-web)

## API

### `boilerplate`

```ts
// Access to the boilerplate stack
LocalStack() => Configure;
LocalStack().add(key:string, callback?:Function)
LocalStack().before(before:string, key?:string, callback?:Function)
LocalStack().after(after:string, key?:string, callback?:Function)
LocalStack().first(key:string, callback?:Function)
LocalStack().last(key:string, callback?:Function)
```

```ts
// Access to the root boilerplate stack
RootStack() => Configure;
RootStack().add(key:string, callback?:Function)
RootStack().before(before:string, key?:string, callback?:Function)
RootStack().after(after:string, key?:string, callback?:Function)
RootStack().first(key:string, callback?:Function)
RootStack().last(key:string, callback?:Function)
```

```ts
// APIs methods from local boilerplate
// By defaults every methods of the local template are global.
LocalAPI() => { [key:string]: Function };
```

```ts
// APIs methods from root boilerplate
RootAPI() => { [key:string]: Function };
```

```ts
// Get or set the root boilerplate destination path
output(str?: string | undefined) => string;
```

Example
```js
LocalStack().add('hello', function() {
  console.log('Hello World')
})

LocalStack().after('bundle', function() {
  console.log('after bundle')
})

LocalStack().before('bundle', function() {
  console.log('before bundle')
})

RootStack().before('bundle', function() {
  console.log('before invocator bundle')
})

RootStack().after('bundle', function() {
  console.log('after invocator bundle')
})

// => before invocator bundle
// => before bundle
// => after bundle
// => Hello World
// => after invocator bundle
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
exec(command: string, options?:any);
```

```ts
// Execute a command synchronously. Return process result
execSync(command: string, options?:any);
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
LocalStack().before('bundle', 'prompt', function() {
  return prompt('Project name:', 'project_name')
})

LocalStack().after('bundle', 'prompt', function() {
  output(output() + '/' + answer('project_name'))
})
```

### `source`

Load another boilerplate

Example

```js
//@source=github:wk-js/wkt-web#skeleton // A repository or repository with a branch/tag
//@source=./assets/template.js // Or a file
```

Example
```js
//@source=../../../boilerplates/skeleton/template.js
//@source=../../../boilerplates/assets/template.js
//@source=../../../boilerplates/bump/template.js
//@source=../../../boilerplates/git/template.js
//@source=../../../boilerplates/webpack/template.js

LocalStack().after('bundle', function() {
  execSync('npm install')
  remove('template.js')
})
```

### `api`

Import custom api function

Example

```js
//@api=github:wk-js/wkt-api // A repository or repository with a branch/tag
//@api=./my_custom_api.js // Or a file
```