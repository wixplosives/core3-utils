import { expect } from 'chai';
import { getIntervalPerformance } from '../measure-machine';

describe('time dilution', () => {
    it('getMachinePerformance', async () => {
        const measure = await getIntervalPerformance();
        expect(measure).to.be.greaterThan(1);
        expect(measure).to.be.lessThan(20);
    });
});
