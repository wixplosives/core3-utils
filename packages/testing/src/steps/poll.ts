import { last } from '@wixc3/common';
import { expect } from 'chai';
import { createTimeoutStep as createTimeoutStep } from './promise';
import type { PollInfo, PollStep, Predicate } from './types';

type Stage = 'action' | 'predicate';

export function createPollStep<T>(
    action: () => T,
    predicate: Predicate<T> | Awaited<T>,
): PollStep<T> {
    let intervalId!: number;
    const clearPollingInterval = () => clearInterval(intervalId);
    const { intervalPromise, resolve, reject } = createIntervalPromise<T>(clearPollingInterval);

    const _predicate = (
        typeof predicate === 'function' ? predicate : (v: Awaited<T>) => expect(v).to.eql(predicate)
    ) as Predicate<T>;

    const p = createTimeoutStep<T>(intervalPromise, true) as unknown as PollStep<T>;

    p._parseInfoForErrorMessage = _parseInfoForErrorMessage;
    p.info = initialInfo();
    p.interval = (ms: number) => {
        clearInterval(intervalId);
        intervalId = setPollingInterval(ms, { p, predicate: _predicate, resolve, reject, action });
        p.info.interval = ms;
        setTimeout(() => pollOnce({ p, predicate: _predicate, resolve, reject, action }), 0);
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

function createIntervalPromise<T>(clearInterval: () => void) {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;
    const intervalPromise = new Promise<T>((_resolve, _reject) => {
        resolve = (value: T) => {
            clearInterval();
            _resolve(value);
        };
        reject = (reason: any) => {
            clearInterval();
            _reject(reason);
        };
    });
    return { intervalPromise, resolve, reject };
}

type PollHelpers<T> = {
    predicate: Predicate<T>;
    resolve: (v: T) => void;
    reject: (r: any) => void;
    action: () => T;
    p: PollStep<T>;
};

function setPollingInterval<T>(ms: number, helpers: PollHelpers<T>) {
    return setInterval(() => pollOnce<T>(helpers), ms);
}

async function pollOnce<T>({ p, action, predicate, resolve, reject }: PollHelpers<T>) {
    try {
        const value = await Promise.resolve(action());
        p.info.polledValues.push({ action: value });
        try {
            if (predicate(value) !== false) {
                resolve(value);
            }
        } catch (e) {
            handleError(e, 'predicate', p, reject);
        }
    } catch (e) {
        handleError(e, 'action', p, reject);
    }
}

function handleError<T>(e: any, type: Stage, p: PollStep<T>, reject: (reason: any) => void) {
    if (p.info.allowErrors[type]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        p.info.polledValues.push({ [type]: e } as Record<Stage, any>);
    } else {
        reject(e);
    }
}

function _parseInfoForErrorMessage(p: PollInfo) {
    const logEntry = last(p.polledValues);
    if (logEntry) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const [type, value] = Object.entries(logEntry)[0]!;
        return `last ${type} returned: ${JSON.stringify(value, null, 2)}`;
    }
    return `No values polled`;
}

function initialInfo(): PollInfo {
    return {
        description: '',
        polledValues: [],
        interval: 0,
        timeout: 0,
        allowErrors: {
            action: false,
            predicate: true,
        },
    };
}
