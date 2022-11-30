import { expect } from 'chai';
import { size } from '@wixc3/common';

export function expectSize(expected: number) {
    return (iterable: Iterable<any>) => expect(size(iterable)).to.equal(expected);
}

export function expectIncludesDeep(expected: any) {
    return (actual: object) => expect(actual).to.deep.include(expected);
}

export function expectIncludes(expected: any) {
    return (actual: object) => expect(actual).to.include(expected);
}
