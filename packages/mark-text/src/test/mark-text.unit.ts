/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { expect } from 'chai';
import { textAndIndexes } from '../mark-text';

describe('mark text', () => {
  it('should return the text and indexes', () => {
    const {
      result,
      indexes: { div, span },
    } = textAndIndexes(
      (mark, { div, span }) => {
        return mark`
        const a = ()=>{
          return ${div`<div>
            ${span`<span/>`}
          </div>`}
        }
      `;
      },
      ['div', 'span']
    );
    expect(div.start).to.equal(result.indexOf('<div>'));
    expect(div.end).to.equal(result.indexOf('</div>') + '</div>'.length);
    expect(span.start).to.equal(result.indexOf('<span/>') + '<span/>'.length);
    expect(span.end).to.equal(result.indexOf('<span/>') + '<span/>'.length);
  });
});
