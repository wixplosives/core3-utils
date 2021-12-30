import { checkExpectValues, errorString, stringify } from './mostly-equal';

import chai from 'chai';
export const mostlyEqlChaiPlugin: Chai.ChaiPlugin = (c) => {
  c.Assertion.addMethod('mostlyEqual', function (this, expected) {
    const res = checkExpectValues(errorString(expected, this._obj, 0));
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
    this.assert(
      !error,
      message.join(''),
      `expected ${stringify(this._obj, 0)} to not eql expected`,
      this._obj,
      expected
    );
  });
};

// hack to get anyone that imports notImportant have the matcher
chai.use(mostlyEqlChaiPlugin);
