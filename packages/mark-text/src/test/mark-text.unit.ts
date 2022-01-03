import { expect } from 'chai';
import { createMarkers, markText } from '../mark-text';

describe('mark text', () => {
  it('should return the text and indexes', () => {
    const { div, span } = createMarkers('div', 'span');

    const result = markText`
        const a = ()=>{
          return ${div`<div>
            ${span`<span/>`}
          </div>`}
        }
      `;
    expect(div.getPos().start, 'div start').to.equal(result.indexOf('<div>'));
    expect(div.getPos().end, 'div end').to.equal(result.indexOf('</div>') + '</div>'.length);
    expect(span.getPos().start, 'span start').to.equal(result.indexOf('<span/>'));
    expect(span.getPos().end, 'span end').to.equal(result.indexOf('<span/>') + '<span/>'.length);
  });
});
