import { expect } from "chai";

/**
 * This is needed to handle cases when function should be called through native chai's implementation rather then  within `chaiRetryPlugin`, for example:
 * @example
 * const myObj = { val: 1 },
 *       addTwo = () => {
 *              attempts++;
 *              myObj.val += 2;
 *          };
 * await expect(addTwo).retry().to.increase(myObj, 'val').by(2);
 */
export const chaiMethodsThatHandleFunction: (keyof ReturnType<typeof expect>)[] = ['change', 'decrease', 'increase'];
