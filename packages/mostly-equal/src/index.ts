// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../mostly-equal-chai.d.ts" preserve="true" />
/**
 * @packageDocumentation
 * Adds chai matches for partial equality of JSONs
 *
 * @example
 * ```ts
 *  import * as chai from 'chai';
 *  import { expect } from 'chai';
 *  import {mostlyEqlChaiPlugin, notImportant} from '@wixc3/mostly-equal'
 *  chai.use(mostlyEqlChaiPlugin)
 *  expect({a: 1}).to.mostlyEqual({
 *           a: 1,
 *       b: notImportant,
 *   });
 * ```
 *
 */
export * from './mostly-equal.js';
export * from './mostly-equal-chai-plugin.js';
export * from './mostly-equal-matchers.js';
export * from './safe-print.js';
export * from './html-formatter.js';
export * from './types.js';
