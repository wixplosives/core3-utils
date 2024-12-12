import { isObject } from './objects.js';

/**
 * Convert any kind of value to an error instance. Unless the value is already
 * an error instance, it's stringified and used as the error message.
 */
export function toError(value: unknown): Error {
    return value instanceof Error ? value : new Error(value === undefined ? undefined : String(value as string));
}

/**
 * Returns error.code property if the error object has it, otherwise returns undefined.
 */
export function getErrorCode(error: Error & { code?: string }): string | undefined {
    return typeof error.code === 'string' ? error.code : undefined;
}

/**
 * Creates an error with error code. Helpful when `instanceof` can't be used
 * because the error was serialized and then deserialized.
 * @example
 * ```ts
 * try {
 *     throw new ErrorWithCode('message', { code: 'ENOENT' });
 * } catch (error) {
 *     if (getErrorCode(toError(error)) === 'ENOENT') {
 *         // ...
 *     }
 * }
 * ```
 */
export class ErrorWithCode extends Error {
    public code?: string;

    public constructor(message?: string, options?: { code?: string; cause?: unknown }) {
        const { code, ...nativeErrorOptions } = options ?? {};
        super(message, nativeErrorOptions);
        this.code = code;
    }
}

/**
 * Allows the type checker to detect non-exhaustive switch statements.
 * @example
 * ```ts
 * declare const align: 'left' | 'right' | 'middle';
 * switch (align) {
 *     case 'left': return 1;
 *     case 'right': return 2;
 *     // type error since 'middle' is not handled
 *     default: throw new UnreachableCaseError(align);
 * }
 * ```
 */
export class UnreachableCaseError extends Error {
    constructor(switchValue: never) {
        super(`Unreachable switch case: ${JSON.stringify(switchValue)}`);
    }
}

export function stringifyErrorStack(error: unknown): string {
    if (isErrorLikeObject(error)) {
        // in v8, e.stack includes "<name>: <message>"
        // in other js runtimes, it only includes the stack
        const { name, message, stack = '' } = error;
        const namePlusMessage = `${name}: ${message}`;
        return stack.startsWith(namePlusMessage) ? stack : `${namePlusMessage}\n${stack}`;
    }
    return String(error);
}

export function errorToPlainObject<T extends Error>(error: T) {
    return {
        ...error,
        message: error.message,
        name: error.name,
        stack: error.stack,
    };
}

/**
 * Checks if the `error` is an object compatible with the Error interface; that is,
 * it has properties 'name' and 'message' of type string. The object could be an
 * instance of an Error, or it could be some other kind of object that has these
 * properties.
 */
export function isErrorLikeObject(error: unknown): error is Error {
    return isObject(error) && typeof error.name === 'string' && typeof error.message === 'string';
}
