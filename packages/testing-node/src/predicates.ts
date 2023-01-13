import { expect } from 'chai';
import type { FsPredicate } from './path-step';

/**
 * Handy predicate creators for {@link @wixc3/testing#waitForPath | waitForPath}
 *
 * @privateRemarks
 * These functions are defined as a class static simply to make the generated docs look nice
 */
export class Path {
    /**
     * Satisfied when the path exists
     * @example
     * ```ts
     * await waitForPath(fs, 'some-path', Path.exists());
     * ```
     */
    static exists(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(stats || fs.existsSync(path), `path "${path}" doesn't exist`).not.to.equal(false);
        };
    }

    /**
     * Satisfied when the path doesn't exists
     * @example
     * ```ts
     * await waitForPath(fs, 'some-path', Path.exists());
     * ```
     */
    static notExists(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(stats || fs.existsSync(path), `path "${path}" doesn't exist`).to.equal(false);
        };
    }

    /**
     * Satisfied when the path is a file
     * @example
     * ```ts
     * await waitForPath(fs, 'file', Path.isFile());
     * ```
     */
    static isFile(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(
                stats?.isFile() || fs.statSync(path, { throwIfNoEntry: true }).isFile(),
                `path "${path}" isn't a file`
            ).to.equal(true);
        };
    }

    /**
     * Satisfied when the path is a directory
     * @example
     * ```ts
     * await waitForPath(fs, 'dir', Path.isDir());
     * ```
     */
    static isDir(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(
                stats?.isDirectory() || fs.statSync(path, { throwIfNoEntry: true }).isDirectory(),
                `path "${path}" isn't a directory`
            ).to.equal(true);
        };
    }

    /**
     * Satisfied when the path is a file with given content
     * @example
     * ```ts
     * await waitForPath(fs, 'file', Path.hasContent('success!'));
     * ```
     * @example
     * ```ts
     * await waitForPath(fs, 'file', Path.hasContent(/success!?/));
     * ```
     * @example
     * ```ts
     * await waitForPath(fs, 'file', Path.hasContent((content)=>content.startWith('success)));
     * ```
     */
    static hasContent(predicate: string | RegExp | ((actual: string) => boolean)): FsPredicate {
        return ({ fs, path }) => {
            const content = fs.readFileSync(path, 'utf8');
            if (typeof predicate === 'string') {
                expect(content).to.equal(predicate);
            } else if (predicate instanceof RegExp) {
                expect(content).to.match(predicate);
            } else {
                expect(predicate(content), 'file content predicate').to.equal(true);
            }
        };
    }
}
