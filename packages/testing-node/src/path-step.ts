import type { IFileSystem, IWatchEvent } from '@file-services/types';
import { Description, Info, poll, PollInfo, Predicate, StepBase, Timeout } from '@wixc3/testing';
import _fs from '@file-services/node';

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

export function pathStep(fs: IFileSystem, path: string, predicate: FsPredicate): FsStep {
    let resolved = false;
    const p = poll(
        async () => ({ fs, path, stats: await fs.promises.stat(path).catch(() => null) }),
        (data) => resolved || predicate(data)
    ) as unknown as FsStep;

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
export function waitForPath(path: string, predicate: FsPredicate, fs: IFileSystem = _fs) {
    return pathStep(fs, path, predicate);
}
