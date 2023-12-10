import { ProcessingConfig, _docs, _packages } from './common';

export { ProcessingConfig };

export type Macro = (config: ProcessingConfig, filename: string, ...args: string[]) => string;

export type Macros = Record<string, Macro>;

export class MacroError extends Error {
    constructor(
        public config: ProcessingConfig,
        public file: string,
        fn: Macro,
        args: string[],
        _message: string,
    ) {
        super(`in ${_docs(config, file)} - [[[${fn.name}${args.length ? ' ' + args.join(' ') : ''}]]]:
    ${_message}`);
    }
}
