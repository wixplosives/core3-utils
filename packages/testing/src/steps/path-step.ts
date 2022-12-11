import type { IFileSystem, IWatchEvent } from '@file-services/types';
import { poll } from './steps';
import type { FsPredicate, FsStep } from './types';

export function pathStep(fs: IFileSystem, path: string, predicate: FsPredicate): FsStep {
    let resolved = false
    const p =  poll(async () => ({fs, path, stats:await fs.promises.stat(path).catch(()=>null)}), 
    (data) => resolved || predicate(data)
    ) as unknown as FsStep

    const listener = (event: IWatchEvent) => {
        try {
            const value = predicate({ ...event, fs });
            if (value !== false) resolved = true
        } catch {
            //
        }
    };


    void fs.watchService.watchPath(path, listener)

    const cleanup = () => {
        void fs.watchService.unwatchPath(path, listener)
    };
    p.then(cleanup, cleanup);

    return p;
}
