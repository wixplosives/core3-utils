import { last } from '@wixc3/common';
import { expect } from 'chai';
import { createTimeoutStep as createTimeoutStep } from './with-timeout';
import type { PollInfo, PollStep, Predicate } from './types';
import { deferred } from 'promise-assist';

type Stage = 'action' | 'predicate';

export function createPollStep<T>(action: () => T, predicate: Predicate<T> | Awaited<T>): PollStep<T> {
    const { promise, reject, resolve } = deferred<T>();
    const state: PollState<T> = {
        reject,
        resolve,
        predicate: (typeof predicate === 'function'
            ? predicate
            : (v: Awaited<T>) => expect(v).to.eql(predicate)) as Predicate<T>,
        p: createTimeoutStep<T>(promise, true) as unknown as PollStep<T>,
        action,
        isSettled: false,
    };
    const p = state.p;

    p._parseInfoForErrorMessage = _parseInfoForErrorMessage;
    p.info = initialInfo();
    p.interval = (ms: number) => {
        p.info.interval = ms;
        return p;
    };
    p.allowErrors = (action = true, predicate = true) => {
        p.info.allowErrors = { action, predicate };
        return p;
    };
    p.catch((e) => {
        state.isSettled = true;
        reject(e);
    });

    setTimeout(() => poll(state), 0);

    return p;
}

type PollState<T> = {
    predicate: Predicate<T>;
    resolve: (v: T) => void;
    reject: (r: any) => void;
    action: () => T;
    p: PollStep<T>;
    isSettled: boolean;
};

async function poll<T>(state: PollState<T>) {
    while (!state.isSettled) {
        try {
            const {
                action,
                p: {
                    info: { polledValues },
                },
                resolve,
                predicate,
            } = state;

            const value = await Promise.resolve(action());
            polledValues.push({ action: value });
            try {
                if (predicate(value) !== false) {
                    state.isSettled = true;
                    resolve(value);
                }
            } catch (e) {
                handleError(e, 'predicate', state);
            }
        } catch (e) {
            handleError(e, 'action', state);
        }
        if (!state.isSettled) {
            await createTimeoutStep(new Promise<void>(() => void 0), false, false).timeout(state.p.info.interval);
        }
    }
}

function handleError<T>(e: any, type: Stage, state: PollState<T>) {
    const {
        p: { info },
        reject,
    } = state;
    if (info.allowErrors[type]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        info.polledValues.push({ [type]: e } as Record<Stage, any>);
    } else {
        state.isSettled = true;
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
