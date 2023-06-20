import { expect } from 'chai';

export const chaiMethodsThatHandleFunction: (keyof ReturnType<typeof expect>)[] = ['change', 'decrease', 'increase'];
