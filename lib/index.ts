import { API } from './api/api';
import { FileAPI } from './api/file/file';
import { MacroAPI } from './api/macro/macro';
import { BoilerplateAPI } from './api/boilerplate/boilerplate';
import { PromptAPI } from './api/prompt/prompt';
import { ExecAPI } from './api/exec/exec';
import { Boilerplate } from './boilerplate/boilerplate';

API.Resolver.register( 'file', FileAPI )
API.Resolver.register( 'macro', MacroAPI )
API.Resolver.register( 'boilerplate', BoilerplateAPI )
API.Resolver.register( 'prompt', PromptAPI )
API.Resolver.register( 'exec', ExecAPI )

export { Boilerplate, API }