import { expect } from 'chai';
import { LRUCache } from '..';

describe('LRU cache', () => {
    it('adds, deletes cache entries and limits cache size', () => {
        const maxSize = 3;
        const cache = new LRUCache({ maxSize });

        // adds value to the cache
        cache.set('a', 1);
        expect(cache.has('a')).to.be.true;
        expect(cache.get('a')).to.be.equal(1);
        cache.set('b', 2);
        expect(cache.has('b')).to.be.true;
        expect(cache.get('b')).to.be.equal(2);
        expect(cache.size()).to.be.equal(2);

        // limits cache size and removes the oldest entry
        cache.set('c', 3);
        cache.set('d', 4);
        expect(cache.size()).to.be.equal(maxSize);
        expect(cache.has('a')).to.be.false;
        expect(cache.has('b')).to.be.true;

        cache.set('e', 5);
        expect(cache.size()).to.be.equal(maxSize);
        expect(cache.has('b')).to.be.false;

        //deletes values
        cache.delete('e');
        expect(cache.size()).to.be.equal(maxSize - 1);
        expect(cache.has('e')).to.be.false;

        // clears cache
        cache.clear();
        expect(cache.size()).to.be.equal(0);
    });
});
