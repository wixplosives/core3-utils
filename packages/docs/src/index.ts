/**
 * @packageDocumentation
 * Tool + CLI for docs generation from TSDocs
 * @example <caption>generate automatically updated github pages</caption>
 * ```bash
 * yarn add [[[packageName]]]
 * yarn docs init
 * git push 
 * ```
 * @example <caption>build documentation locally</caption>
 * ```bash
 * yarn add [[[packageName]]]
 * yarn docs build
 * ```
 */
export * from './build-docs' 
export * from './create-readme' 
export * from './init'
export {cli} from './cli' 

