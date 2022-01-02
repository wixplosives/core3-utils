import { checkExpectValues, errorString } from './mostly-equal';
import { safePrint } from './safe-print';

export const mostlyEqlChaiPlugin: Chai.ChaiPlugin = (c) => {
  c.Assertion.addMethod('mostlyEqual', function (this, expected) {
    const res = checkExpectValues(errorString(expected, this._obj, 0, [], new Map(), new Set()));
    let error = false;
    const message = res.map((item) => {
      if (typeof item !== 'string') {
        error = true;
        return `

/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
${item.message}
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
`;
      }
      return item;
    });
    this.assert(!error, message.join(''), `expected ${safePrint(this._obj)} to not eql expected`, this._obj, expected);
  });
};
