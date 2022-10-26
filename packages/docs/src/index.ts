/**
 * @packageDocumentation
 * Tool + CLI for docs generation from TSDocs
 * @example <caption>Generate automatically updated github pages</caption>
 * ```bash
 * yarn add [[[packageName]]]
 * yarn docs init
 * git push
 * ```
 * @example <caption>Build documentation locally</caption>
 * ```bash
 * yarn docs build
 * ```
 * @example <caption>Generate README.md in all packages (after docs build)</caption>
 * ```bash
 * yarn docs readme
 * ```
 * @remarks
 * [[[h 3 Templates]]]
 * Site pages includes the following templates from docs-config:
 *
 * - index.md - main page header
 *
 * - package.md - packages root page header
 *
 * - item.md - header for other files
 *
 * [[[h 3 Macros]]]
 * There are many awesome macros you can use in your TDDocs.
 * Using macros look like this *[[[macro and args]]]
 *
 * Available macros are:
 *
 * [[[listMacros]]]
 *
 */
export * from './build-docs';
export * from './create-readme';
export * from './init';
export { cli } from './cli';
