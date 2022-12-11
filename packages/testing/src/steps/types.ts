// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/@types/chai/index.d.ts" />

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
    timeout: number;
}

/**
 * Steps base
 */
export interface Step<T extends Info = Info, R = any> extends Promise<R> {
    stack: string;
    info: T;
    /**
     * @internal
     * parses the info field for the error message
     */
    _parseInfoForErrorMessage: (info: T) => string;
}

/**
 * Sets step timeout
 */
export type Timeout<T> = (ms: number) => T;

/**
 * Sets step description
 */
export type Description<T> = (description: string) => T;

/**
 * WithTimeout API
 */
export interface PromiseWithTimeout<T> extends Step<Info, T> {
    timeout: Timeout<PromiseWithTimeout<T>>;
    description: Description<PromiseWithTimeout<T>>;
    info: Info;
    stack: string;
}

/**
 * Polling API
 */
export interface PollStep<T> extends Step<PollInfo, T> {
    timeout: Timeout<PollStep<T>>;
    description: Description<PollStep<T>>;
    interval: (ms: number) => PollStep<T>;
    allowErrors: (action?: boolean, predicate?: boolean) => PollStep<T>;
    stack: string;
    info: PollInfo;
}

/**
 * Info added to polling exceptions
 */
export interface PollInfo extends Info {
    polledValues: ({ action: any } | { predicate: any })[];
    interval: number;
    timeout: number;
    allowErrors: {
        action: boolean;
        predicate: boolean;
    };
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
     * default: 1000
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
