// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/@types/chai/index.d.ts" />

import type { IFileSystem, IWatchEvent } from '@file-services/types';

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
export type Description<T> = (description: string) => T;

/**
 * WithTimeout API
 */
export interface PromiseWithTimeout<T> extends StepBase<Info & { timeout: number }, T> {
    timeout: Timeout<PromiseWithTimeout<T>>;
    description: Description<PromiseWithTimeout<T>>;
}

/**
 * Polling API
 */
export interface PollStep<T> extends StepBase<PollInfo, T> {
    timeout: Timeout<PollStep<T>>;
    description: Description<PollStep<T>>;
    interval: (ms: number) => PollStep<T>;
    allowErrors: (action?: boolean, predicate?: boolean) => PollStep<T>;
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


interface FileInfo extends Info {
    path: string;
    exists: boolean;
    fs: IFileSystem;
    history: any[];
}

export type FsPredicate = Predicate<IWatchEvent & { fs: IFileSystem }>;
export interface FsStep extends StepBase<PollInfo & FileInfo, IWatchEvent & { fs: IFileSystem }> {
    timeout: Timeout<FsStep>;
    description: Description<FsStep>;
    interval: (ms: number) => FsStep;
}