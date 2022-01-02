/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { expect } from 'chai';
import { textAndIndexes } from '../mark-text';

describe('mark text', () => {
  it('should return the text and indexes', () => {
    const {
      result,
      indexes: { div },
    } = textAndIndexes((mark, { div, span }) => {
      return mark`
        const a = ()=>{
          return ${div`<div>
            ${span`<span/>`}
          </div>`}
        }
      `;
    });
    expect(div.start).to.equal(result.indexOf('<div/>'));
  });
});
