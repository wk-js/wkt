import { API } from './api';
import { FileAPI } from './api/file';
import { MacroAPI } from './api/macro';
import { StackAPI } from './api/stack';
import { PromptAPI } from './api/prompt';
import { ExecAPI } from './api/exec';
import { TemplateAPI } from './api/template';
import { Boilerplate } from './boilerplate';

API.Resolver.register( 'file', FileAPI )
API.Resolver.register( 'macro', MacroAPI )
API.Resolver.register( 'stack', StackAPI )
API.Resolver.register( 'prompt', PromptAPI )
API.Resolver.register( 'exec', ExecAPI )
API.Resolver.register( 'template', TemplateAPI )

export { Boilerplate, API }