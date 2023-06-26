// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../mostly-equal-chai.d.ts" />
/**
 * @packageDocumentation
 * Adds chai matches for partial equality of JSONs
 *
 * @example
 * ```ts
 *  import chai, { expect } from 'chai';
 *  import {mostlyEqlChaiPlugin, notImportant} from '@wixc3/mostly-equal'
 *  chai.use(mostlyEqlChaiPlugin)
 *  expect({a: 1}).to.mostlyEqual({
 *           a: 1,
 *       b: notImportant,
 *   });
 * ```
 *
 */
export * from './mostly-equal';
export * from './mostly-equal-chai-plugin';
export * from './mostly-equal-matchers';
export * from './safe-print';
export * from './html-formater';
export * from './types';
