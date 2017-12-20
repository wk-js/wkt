import { FileAPI } from './api/file/file';
import { MacroAPI } from './api/macro/macro';
import { StackAPI } from './api/stack/stack';
import { Boilerplate } from './boilerplate';
import { API } from './api';
import { PromptAPI } from './api/prompt/prompt';

API.Resolver.register( 'file', FileAPI )
API.Resolver.register( 'macro', MacroAPI )
API.Resolver.register( 'stack', StackAPI )
API.Resolver.register( 'prompt', PromptAPI )

export { Boilerplate, API }