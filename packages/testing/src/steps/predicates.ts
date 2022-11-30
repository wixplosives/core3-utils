import { expect } from 'chai';
import { size } from '@wixc3/common';

export function expectSize(expected: number) {
    return (iterable: Iterable<any>) => expect(size(iterable)).to.equal(expected);
}

export function expectIncludesDeep(expected: object) {
    return (iterable: Iterable<any>) => expect(size(iterable)).to.equal(expected);
}

export function expectIncludes(expected: object) {
    return (iterable: Iterable<any>) => expect(size(iterable)).to.equal(expected);
}
