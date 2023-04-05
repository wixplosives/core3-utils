/**
         * This is needed to handle cases when assertion ends with property, for example:
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
    'arguments',
    'all',
    'own',
];
