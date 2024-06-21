/// <reference types="chai" preserve="true" />

/**
 * @internal
 * Promise.all return type
 */
export type _PromiseAll<T extends Readonly<any[]>> = { -readonly [P in keyof T]: Awaited<T[P]> };

/**
 * Step info base, added step errors
 */
export interface Info {
    description: string;
    extra?: object | string;
}

/**
 * Common step props
 */
export interface StepBase<T extends Info = Info, R = any> extends Promise<R> {
    stack: string;
    info: T;
    /**
     * @internal
     * parses the info field for the error message
     */
    _parseInfoForErrorMessage: (info: T) => string;
    description: Description<StepBase<T>>;
}

export interface PromiseStep<T> extends StepBase<Info, T> {
    description: Description<PromiseStep<T>>;
}

/**
 * Sets step timeout
 */
export type Timeout<T> = (ms: number) => T;

/**
 * Sets step description
 */
export type Description<T> = (description: string, extraInfo?: () => object | string | Promise<object | string>) => T;

/**
 * WithTimeout API
 */
export interface PromiseWithTimeout<T> extends StepBase<Info & { timeout: number }, T> {
    timeout: Timeout<PromiseWithTimeout<T>>;
    description: Description<PromiseWithTimeout<T>>;
}

/**
 * A predicate function
 *
 * Any return value other than **false** or throwing is considered as satisfying the predicate
 */
export type Predicate<T> = (actionResult: Awaited<T>) => boolean | Chai.Assertion | void;

/**
 * Test step defaults
 */
export interface StepsDefaults {
    /**
     * Common to all step types
     */
    step: TimeoutDefaults;
    /**
     * Poll steps defaults
     */
    poll: PollDefaults;
}

/**
 * Step timeout defaults
 */
export interface TimeoutDefaults {
    /**
     * default: 5000
     */
    timeout: number;
    /**
     * Added per each step used in a test
     * default: 50
     */
    safetyMargin: number;
}

/**
 * Defaults for poll steps
 */
export interface PollDefaults {
    /**
     * default: 100
     */
    interval: number;
    /**
     * default: false
     */
    allowActionError: boolean;
    /**
     * default: true
     */
    allowPredicateError: boolean;
}
