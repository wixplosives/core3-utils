import { isPlainObject } from './objects';

/**
 * Convert any kind of value to an error instance. Unless the value is already
 * an error instance, it's stringified and used as the error message.
 */
export const toError = (value: unknown): Error =>
    value instanceof Error ? value : new Error(value === undefined ? undefined : String(value));

/**
 * Returns error.code property if the error object has it, otherwise returns undefined.
 */
export const getErrorCode = (error: Error & { code?: string }): string | undefined => {
    return typeof error.code === 'string' ? error.code : undefined;
};

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
 * declare const align: 'left' | 'right' | 'middle';
 * switch (align) {
 *     case 'left': return 1;
 *     case 'right': return 2;
 *     // type error since 'middle' is not handled
 *     default: throw new UnreachableCaseError(align);
 * }
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

export function isErrorLikeObject(error: unknown): error is Error {
    return (
        isPlainObject(error) &&
        typeof (error as { name?: string }).name === 'string' &&
        typeof (error as { message?: string }).message === 'string'
    );
}
