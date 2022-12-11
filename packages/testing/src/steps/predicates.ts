import { expect } from 'chai';
import { size } from '@wixc3/common';
import type { FsPredicate, Predicate } from './types';

/**
 * Handy predicate creators for {@link @wixc3/testing#poll | poll}
 *
 * @privateRemarks
 * These functions are defined as a class static simply to make the generated docs look nice
 */
export class Expected {
    /**
     * Satisfied when the iterable has the expected size
     */
    static size(expected: number): Predicate<any> {
        return (iterable: Iterable<any>) => expect(size(iterable)).to.equal(expected);
    }

    /**
     * Satisfied when the action result deep includes the expected value
     * @example
     * ```ts
     * wait poll(()=>[{},1], Expected.includesStrict({}) // pass
     * wait poll(()=>[{},1], Expected.includesStrict(1) // pass
     * wait poll(()=>[{},1], Expected.includesStrict(null) // fail
     * ```
     */
    static includes(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.deep.include(expected);
    }

    /**
     * Satisfied when the action result is an array that strictly includes the expected value
     * @example
     * ```ts
     * wait poll(()=>[{},1], Expected.includesStrict({}) // fail
     * wait poll(()=>[{},1], Expected.includesStrict(1) // pass
     *
     * ```
     */
    static includesStrict(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.include(expected);
    }

    /**
     * Satisfied when the action result deep contains the expected value
     * @example
     * ```ts
     * wait poll(()=>({a:{}, b:1}), Expected.contains({a:{}})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.contains({a:{c:{}}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.contains({b:1})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.contains({b:2})) // fail
     * ```
     */
    static contains(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.deep.contain(expected);
    }

    /**
     * Satisfied when the action result contains the expected value
     * @example
     * ```ts
     * const v = {}
     * wait poll(()=>({a:v, b:1}), Expected.containsStrict({a:v})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsStrict({a:{}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.containsStrict({a:{c:{}}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.containsStrict({b:1})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsStrict({b:2})) // fail
     * ```
     */
    static containsStrict(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.contain(expected);
    }
}

export class Path {
    static exists(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(stats || fs.existsSync(path), `path "${path}" doesn't exist`).not.to.equal(false)
        };
    }

    static isFile(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(
                stats?.isFile() || fs.statSync(path, { throwIfNoEntry: true }).isFile(),
                `path "${path}" isn't a file`
            ).to.equal(true);
        };
    }

    static isDir(): FsPredicate {
        return ({ fs, path, stats }) => {
            expect(
                stats?.isDirectory() || fs.statSync(path, { throwIfNoEntry: true }).isDirectory(),
                `path "${path}" isn't a directory`
            ).to.equal(true);
        };
    }

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
