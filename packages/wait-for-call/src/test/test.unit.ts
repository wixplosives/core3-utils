import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { createWaitForCall } from '../wait-for-call.js';

chai.use(chaiAsPromised);

describe('Wait For Call', () => {
    it('mocks a call', async () => {
        const myFunction = (arg: string) => arg;
        const { waitForCall } = createWaitForCall<typeof myFunction>('name', myFunction);
        const call = waitForCall(([args]) => args[0] === 'testCall');
        myFunction('testCall');
        await expect(call).to.eventually.not.be.rejected;
    });
});
