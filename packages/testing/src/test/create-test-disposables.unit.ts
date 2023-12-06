import { expect } from 'chai';
import { createTestDisposables } from '../create-test-disposables';
/**
 * NOTE: these tests assume to run in order! and order of creation matter!.
 * this is because we test the integration itself to mocha, during mocha tests.
 */
describe('createTestDisposables', () => {
    const disposed = [] as string[];
    // before we create the disposables
    afterEach(() => {
        expect(disposed.length, 'nothing disposed yet!').to.eql(0);
    });
    // create the disposables
    const td = createTestDisposables();
    // after each test we expect one handler to be disposed
    afterEach(() => {
        expect(disposed.length, 'one handler after the each test').to.eql(1);
        disposed.length = 0;
    });
    it('test1', () => {
        td.add('test1', () => disposed.push('test1'));
    });
    it('test2', () => {
        td.add('test2', () => disposed.push('test2'));
    });
});

describe('createTestDisposables', () => {
    const disposed = [] as string[];
    // after before we create the disposables
    after(() => {
        expect(disposed.length, 'nothing disposed yet!').to.eql(0);
    });
    // create the disposables
    const td = createTestDisposables(after);
    // after each test we expect no handler to be disposed we are in after mode
    afterEach(() => {
        expect(disposed.length, 'nothing disposed yet!').to.eql(0);
    });
    // after the all tests we expect two handlers to be disposed
    after(() => {
        expect(disposed.length, 'two handlers after the all test').to.eql(2);
        disposed.length = 0;
    });
    it('test1', () => {
        td.add('test1', () => disposed.push('test1'));
    });
    it('test2', () => {
        td.add('test2', () => disposed.push('test2'));
    });
});
