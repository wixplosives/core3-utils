/**
 * @packageDocumentation
 * Utils for making mocha + chai testing easy and fun
 *
 * @remarks
 * [[[h 3 Steps]]]
 * Steps are a convenient way to craft async tests.
 * A step has a timeout and a description, making test timeouts easy to understand and debug.
 * Each step timeout auto increases the test timeout, assuring the step will time out before the test
 *
 * [[[h 4 Available steps:]]]
 * - {@link poll} until a predicate is satisfied
 *
 * - {@link withTimeout} adds timeout and description to a promise]
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
 * [[[h 3 Test timeout manipulation]]]
 * - DEBUG=true env variable will set test timeouts and time dilation to infinity so tests (that don't explicitly override timeout) will not time out on breakpoints
 * 
 * - {@link timeDilation} multiplies {@link step} timeouts when debugging or running on slow CI machines
 * 
 * - {@link adjustTestTime} adjusts current test timeout (for use in non step async actions)
 * 
 * - {@link locatorTimeout} creates a locator timeout and adjust the current test
 */
export * from './steps';
export * from './safe-fake-timer';
export * from './dispose';
export * from './randomize-tests-order';
export * from './mocha-ctx'
export * from './time-dilation'
