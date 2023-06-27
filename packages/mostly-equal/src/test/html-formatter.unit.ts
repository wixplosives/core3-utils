import { expect } from 'chai';
import { safePrint } from '../safe-print';
import { HTMLFormatter, PseudoElement } from '../html-formatter';

class FakeElement implements PseudoElement {
    constructor(readonly tagName = 'div') {
        //
    }

    attributes = [] as unknown as Element['attributes'];
    children = [] as unknown as Element['children'];

    setAttribute(name: string, value: string) {
        (this.attributes as unknown as { name: string; value: string }[]).push({ name, value });
    }
}

describe('html formatter', () => {
    it('should support native elements', () => {
        const obj = {
            el: new FakeElement('div'),
        };
        const expectedObj = {
            el: '<div/>',
        };

        const actual = safePrint(obj, 10, [HTMLFormatter(FakeElement)]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });

    it('should support attributes', () => {
        const obj = {
            el: new FakeElement('input'),
        };
        obj.el.setAttribute('id', 'a');
        obj.el.setAttribute('name', 'b');
        const expectedObj = {
            el: '<input id="a" name="b" />',
        };

        const actual = safePrint(obj, 10, [HTMLFormatter(FakeElement)]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });

    it('should show number of children', () => {
        const obj = {
            el: new FakeElement('p'),
        };
        obj.el.children = [new FakeElement('span'), new FakeElement('span')] as unknown as Element['children'];
        const expectedObj = {
            el: '<p>2 children</p>',
        };

        const actual = safePrint(obj, 10, [HTMLFormatter(FakeElement)]);
        expect(actual).to.equal(JSON.stringify(expectedObj, null, 2));
    });
});
