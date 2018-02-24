import { API } from './experimental/api';
import { FileAPI } from './experimental/file';
import { BoilerplateAPI } from './experimental/boilerplate';
import { PromptAPI } from './experimental/prompt';
import { ExecAPI } from './experimental/exec';
import { Boilerplate } from './boilerplate/boilerplate';

API.Resolver.register( 'file', FileAPI )
API.Resolver.register( 'boilerplate', BoilerplateAPI )
API.Resolver.register( 'prompt', PromptAPI )
API.Resolver.register( 'exec', ExecAPI )

export { Boilerplate, API }