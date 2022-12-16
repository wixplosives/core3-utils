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
 * - {@link @wixc3/testing#poll} until a predicate is satisfied
 *
 * - {@link @wixc3/testing#withTimeout} adds timeout and description to a promise]
 *
 * - {@link @wixc3/testing#allWithTimeout} time limited Promise.all
 *
 * - {@link @wixc3/testing#waitForSpyCall} spies on a method and wait for first call
 *
 * - {@link @wixc3/testing#waitForStubCall} creates a one off stub and wait for it to be called
 *
 * - {@link @wixc3/testing#step} adds a description (but not timeout) to a promise, useful for playwright locator waitFor
 *
 * - {@link @wixc3/testing#sleep} sleep (and adjust test time)
 * 
 * [[[h 3 Test timeout manipulation]]]
 * When waiting for things that are not steps, these  
 * 
 * - {@link @wixc3/testing#timeDilation} multiplies step timeouts when debugging or running on slow CI machines
 * 
 * - {@link @wixc3/testing#adjustTestTime} adjusts current test timeout (for use in non step async actions)
 * 
 * - {@link @wixc3/testing#locatorTimeout} creates a locator timeout and adjust the current test
 */
export * from './steps';
export * from './safe-fake-timer';
export * from './dispose';
export * from './randomize-tests-order';
export * from './mocha-ctx'
export * from './time-dilation'
