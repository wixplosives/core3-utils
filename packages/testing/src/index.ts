/**
 * @packageDocumentation
 * Utils for making mocha + chai testing easy and fun
 *
 * @remarks
 * [[[h 3 Env variables]]]
 * - DEBUG=true/positive number env variable will set test timeouts and time scale to infinity so tests (that don't explicitly override timeout) will not time out on breakpoints
 *
 * - TIMEOUT_MULTIPLIER=number env variable will multiply all test timeouts by the given number
 *
 * [[[h 3 Test timeout manipulation]]]
 *
 * - {@link scaleTimeout} multiplies timeouts when debugging or running on slow CI machines, based on TIMEOUT_MULTIPLIER and DEBUG env variables
 *
 * - {@link adjustTestTime} adjusts current test timeout (for use in non step async actions)
 *
 * - {@link locatorTimeout} creates a locator timeout and adjust the current test
 *
 * [[[h 3 Steps]]]
 * Steps are a convenient way to craft async tests.
 * A step has a timeout and a description, making test timeouts easy to understand and debug.
 * Each step timeout auto increases the test timeout, assuring the step will time out before the test
 *
 * [[[h 4 Available steps:]]]
 * - {@link withTimeout} adds timeout and description to a promise
 *
 * - {@link allWithTimeout} time limited Promise.all
 *
 * - {@link waitForSpyCall} spies on a method and wait for first call
 *
 * - {@link waitForStubCall} creates a one off stub and wait for it to be called
 *
 * - {@link step} adds a description (but not timeout) to a promise, useful for playwright locator waitFor
 *
 * - {@link sleep} sleep (and adjust test time)
 *
 */
export * from './steps/index.js';
export * from './safe-fake-timer.js';
export * from './dispose.js';
export * from './randomize-tests-order.js';
export * from './mocha-ctx.js';
export * from './chai-retry-plugin/index.js';
export * from './create-test-disposables.js';
export * from './code-matchers/index.js';
export * from './timeouts.js';
