import { expect } from 'chai';
import { createTestDisposables } from '../create-test-disposables';
/**
 * NOTE: these tests assume to run in order! because we test the integration itself to mocha during mocha tests
 */
describe('createTestDisposables', () => {
    const td = createTestDisposables();
    it('Add disposeItem during test', () => {
        td.add('test', () => void 0);
        expect(td.size, 'one handler after the first test').to.eql(1);
    });
    it('test Gone', () => {
        expect(td.size, 'no handlers after the first test').to.eql(0);
        td.add('test2', () => void 0);
        td.add('test3', () => void 0);
        expect(td.size, 'two handler after the second test').to.eql(2);
    });
    it('test2 Gone', () => {
        expect(td.size, 'no handlers after the first test').to.eql(0);
    });
});
