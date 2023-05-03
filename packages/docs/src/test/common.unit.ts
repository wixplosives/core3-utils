import { expect } from 'chai';
import { naiveStripComments } from './test-common';

describe('stripComments', () => {
    it('removes /* */ comments', () => {
        expect(naiveStripComments(`no /* success removing */comments`)).to.equal('no comments');
        expect(
            naiveStripComments(`no /* 
        success removing
         */comments`)
        ).to.equal('no comments');
    });
    it('removes // comments', () => {
        expect(naiveStripComments(`no comments// after code`)).to.equal('no comments');
        expect(naiveStripComments(`// line comments\nno comments`)).to.equal('no comments');
    });
    it('does not identify :// as comment', () => {
        expect(naiveStripComments(`http://url //my site`)).to.equal('http://url');
    });
});
