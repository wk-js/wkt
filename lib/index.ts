import { FileAPI } from './api/file/file';
import { MacroAPI } from './api/macro/macro';
import { StackAPI } from './api/stack/stack';
import { Boilerplate } from './boilerplate';
import { API } from './api';
import { PromptAPI } from './api/prompt/prompt';
import { ExecAPI } from './api/exec/exec';
import { TemplateAPI } from './api/template/template';

API.Resolver.register( 'file', FileAPI )
API.Resolver.register( 'macro', MacroAPI )
API.Resolver.register( 'stack', StackAPI )
API.Resolver.register( 'prompt', PromptAPI )
API.Resolver.register( 'exec', ExecAPI )
API.Resolver.register( 'template', TemplateAPI )

export { Boilerplate, API }