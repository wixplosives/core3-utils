// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/@types/chai/index.d.ts" />
import { expect } from 'chai';
import { promiseStep } from './promise';

export type PollStep<T> = Promise<T> & {
    timeout: (ms: number) => PollStep<T>;
    description: (description: string) => PollStep<T>;
    interval: (ms: number) => PollStep<T>;
    allowErrors: (action?: boolean, predicate?: boolean) => PollStep<T>;
    _description: Readonly<string>;
    stack: string;
    info: any;
    lastPolledValue: T;
};

export type Predicate<T> = (a: Awaited<T>) => boolean | Chai.Assertion | void;

export function pollStep<T>(action: () => T, predicate: Predicate<T> | Awaited<T> | undefined, ctx: Mocha.Context): PollStep<T> {
    let intervalId!: number;
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    let allowErrors = {
        predicate: false,
        action: false,
    };
    let value: Awaited<T>;

    const intervalPromise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    const handleError = (e: any, type: 'action' | 'predicate') => {
        if (allowErrors[type]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            p.info = `last ${type} error: ${e}`;
        } else {
            clearInterval(intervalId);
            reject(e);
        }
    };

    predicate = predicate || ((v: Awaited<T>) => !!v);
    const _predicate = (
        typeof predicate === 'function' ? predicate : (v: Awaited<T>) => expect(v).to.eql(predicate)
    ) as Predicate<T>;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const p = promiseStep(intervalPromise, ctx) as PollStep<T>;
    p.interval = (ms: number) => {
        clearInterval(intervalId);
        intervalId = setInterval(async () => {
            try {
                value = await Promise.resolve(action());
                p.info = `last polled value: ${value}`;
                p.lastPolledValue = value;
                try {
                    if (_predicate(value!) !== false) {
                        clearInterval(intervalId);
                        resolve(value!);
                    }
                } catch (e) {
                    handleError(e, 'predicate');
                }
            } catch (e) {
                handleError(e, 'action');
            }
        }, ms);
        return p;
    };
    p.allowErrors = (action = true, predicate = true) => {
        allowErrors = { action, predicate };
        return p;
    };
    p.catch(() => {
        clearInterval(intervalId);
    });

    return p;
}
