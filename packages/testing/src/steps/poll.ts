// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/@types/chai/index.d.ts" />
import { last } from '@wixc3/common';
import { expect } from 'chai';
import { promiseStep } from './promise';
import type {  PollInfo, PollStep, Predicate, Stage } from './types';

export function pollStep<T>(
    action: () => T,
    predicate: Predicate<T> | Awaited<T> | undefined,
    ctx: Mocha.Context,
    timeDilation: number
): PollStep<T> {
    let intervalId!: number;
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    let value: Awaited<T>;

    const intervalPromise = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    const handleError = (e: any, type:Stage) => {
        if (p.info.allowErrors[type]) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            p.info.polledValues.push({[type]:e} as Record<Stage,any> )
        } else {
            clearInterval(intervalId);
            reject(e);
        }
    };

    predicate = predicate === undefined ? (v: Awaited<T>) => !!v : predicate;
    const _predicate = (
        typeof predicate === 'function' ? predicate : (v: Awaited<T>) => expect(v).to.eql(predicate)
    ) as Predicate<T>;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const p = promiseStep<T>(intervalPromise, ctx, true, timeDilation) as unknown as PollStep<T>;
    p._parseInfoForErrorMessage =_parseInfoForErrorMessage
    
    p.info = initialInfo()

    p.interval = (ms: number) => {
        clearInterval(intervalId);
        intervalId = setInterval(async () => {
            try {
                value = await Promise.resolve(action());
                p.info.polledValues.push({'action':value});
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
        p.info.allowErrors = { action, predicate };
        return p;
    };
    p.catch(() => {
        clearInterval(intervalId);
    });

    return p;
}

function _parseInfoForErrorMessage (p:PollInfo) {
    const logEntry = last(p.polledValues)
    if (logEntry) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const [type, value] = Object.entries(logEntry)[0]!
        return `last ${type} returned: ${JSON.stringify(value, null,2)}`
    }
    return `No values polled`
}

function initialInfo(): PollInfo {
    return {
        description:'',
        polledValues:[],
        interval:0,
        timeout:0,
        allowErrors:{
            action:false,
            predicate:true
        }
    }
}
