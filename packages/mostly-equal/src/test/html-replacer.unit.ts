import JSDOM from 'jsdom-global';
import { expect } from 'chai';
import { safePrint } from '../safe-print';
import { HTMLReplacer } from '../html-replacer';

describe('html replacer', () => {
    JSDOM();
    it('should support native elements', () => {
        const obj = {
            el: document.createElement('div'),
        };
        const expectedObj = {
            el: '<div/>',
        };

        const actual = safePrint(obj, 10, [HTMLReplacer]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });

    it('should support attributes', () => {
        const obj = {
            el: document.createElement('input'),
        };
        obj.el.setAttribute('id', 'a');
        obj.el.setAttribute('name', 'b');
        const expectedObj = {
            el: '<input id="a" name="b" />',
        };

        const actual = safePrint(obj, 10, [HTMLReplacer]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });

    it('should show number of children', () => {
        const obj = {
            el: document.createElement('p'),
        };
        obj.el.append(document.createElement('span'), document.createElement('span'));
        const expectedObj = {
            el: '<p>2 children</p>',
        };

        const actual = safePrint(obj, 10, [HTMLReplacer]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });
});
