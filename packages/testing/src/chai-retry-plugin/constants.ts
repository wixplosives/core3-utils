/**
 * This is needed to handle cases when assertion ends with property or have property calls within, for example:
 * @example
 * await expect(func).retry().to.be.null;
 */
export const assertionPropertyKeys = [
    'ok',
    'true',
    'null',
    'false',
    'undefined',
    'empty',
    'NaN',
    'finite',
    'exist',
    'exists',
    'itself',
    'extensible',
    'sealed',
    'arguments',
    'all',
    'own',
    'deep',
    'nested',
    'not',
    'own',
    'ordered',
    'any',
];

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
export const chaiMethodsThatHandleFunction = ['change', 'decrease', 'increase'];
