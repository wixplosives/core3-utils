import type { IFileSystem, IWatchEvent } from '@file-services/types';
import {
    chaiRetryPlugin,
    Description,
    Info,
    PollInfo,
    Predicate,
    StepBase,
    Timeout,
    PromiseLikeAssertion,
    RetryOptions,
} from '@wixc3/testing';
import _fs from '@file-services/node';
import chai, { expect } from 'chai';

chai.use(chaiRetryPlugin);

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

export type PathStepOptions = RetryOptions & { description?: string };

export function pathStep(
    fs: IFileSystem,
    path: string,
    predicate: FsPredicate,
    pathStepOptions: PathStepOptions
): PromiseLikeAssertion {
    let resolved = false;
    const { description = '', ...retryOptions } = pathStepOptions;

    const p = expect(async () => ({ fs, path, stats: await fs.promises.stat(path).catch(() => null) }), description)
        .retry(retryOptions)
        .to.satisfy((result: IWatchEvent & { fs: IFileSystem }) => {
            try {
                if (!resolved) {
                    predicate(result);

                    return true;
                }

                return false;
            } catch {
                return false;
            }
        });

    const listener = (event: IWatchEvent) => {
        try {
            const value = predicate({ ...event, fs });
            if (value !== false) resolved = true;
        } catch {
            //
        }
    };

    void fs.watchService.watchPath(path, listener);

    const cleanup = () => {
        void fs.watchService.unwatchPath(path, listener);
    };
    p.then(cleanup, cleanup);

    return p;
}

/**
 * waits for a path to satisfy the predicate
 *
 *  {@link @wixc3/testing#Path | Path} as helpful predicator creators.
 *
 * @example
 * ```ts
 * await waitForPath('some-file', ({stats}) => stats?.isSymbolicLink() || false)
 * ```
 * @example
 * ```ts
 * await waitForPath('some-file', Path.isFile())
 * await waitForPath('some-file', Path.exists())
 * await waitForPath('some-file', Path.hasContent('success!'))
 * ```
 */
export function waitForPath(
    path: string,
    predicate: FsPredicate,
    pathStepOptions: PathStepOptions = {},
    fs: IFileSystem = _fs,
) {
    return pathStep(fs, path, predicate, pathStepOptions);
}
