/**
 * @packageDocumentation
 * Utils for making mocha + chai testing easy and fun
 *
 * [[[h 3 Steps]]]
 * Steps are a convenient way to craft async tests.
 * A step has a timeout and a description, making test timeouts easy to understand and debug.
 * Each step timeout auto increases the test timeout, assuring the step will time out before the test
 *
 * [[[h 4 Available steps:]]]
 * - {@link @wixc3/testing#poll}
 *
 * - {@link @wixc3/testing#withTimeout}
 *
 * - {@link @wixc3/testing#allWithTimeout}
 *
 * - {@link @wixc3/testing#waitForSpyCall}
 *
 * - {@link @wixc3/testing#waitForStubCall}
 *
 * - {@link @wixc3/testing#sleep}
 *
 *
 * [[[h 3 Other goodies]]]
 *
 * - {@link @wixc3/testing#disposeAfter} will dispose of test resources after the test is done
 *
 * - {@link @wixc3/testing#useSafeFakeTimers} makes it easy to safely use fake timers
 *
 * - {@link @wixc3/testing#randomizeTestsOrder} will randomize testing order to make sure tests are isolated
 * and distribute load more uniformly when running parallel tests
 */
export * from './steps';
export * from './safe-fake-timer';
export * from './dispose';
export * from './randomize-tests-order';
