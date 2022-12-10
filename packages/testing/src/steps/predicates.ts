import { expect } from 'chai';
import { size } from '@wixc3/common';
import type { Predicate } from './types';

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
     */
    static includesDeep(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.deep.include(expected);
    }

    /**
     * Satisfied when the action result includes the expected value
     */
    static includes(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.include(expected);
    }

    /**
     * Satisfied when the action result deep contains the expected value
     * @example
     * ```ts
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({a:{}})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({a:{c:{}}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({b:1})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({b:2})) // fail
     * ```
     */
    static containsSimilar(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.deep.contain(expected);
    }

    /**
     * Satisfied when the action result contains the expected value
     * @example
     * ```ts
     * const v = {}
     * wait poll(()=>({a:v, b:1}), Expected.containsSimilar({a:v})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({a:{}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({a:{c:{}}})) // fail
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({b:1})) // pass
     * wait poll(()=>({a:{}, b:1}), Expected.containsSimilar({b:2})) // fail
     * ```
     */
    static contains(expected: any): Predicate<any> {
        return (actual: object) => expect(actual).to.contain(expected);
    }
}
