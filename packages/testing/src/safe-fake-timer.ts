import sinon from 'sinon';

/**
 * Makes it easy to safely use fake timers
 * @example
 * ```ts
 * describe('suite', ()=>{
 *      // DO NOT DESTRUCTURE clock here
 *      const clock = useSafeFakeTimers()
 *      it('uses fake times', ()=>{
 *          const {tick} = clock
 *          let wasCalled=false
 *          setTimeout(() => wasCalled=true, 100)
 *          tick(100)
 *          expect(wasCalled).to.equal(true)
 *      })
 * })
 * ```
 */
export function useSafeFakeTimers(): sinon.SinonFakeTimers {
    const clocks = [] as sinon.SinonFakeTimers[];
    const clock = {} as sinon.SinonFakeTimers;

    beforeEach(() => {
        clocks.push({ ...clock });
        const _clock = sinon.useFakeTimers();
        Object.assign(clock, _clock);
        clock.tick;
    });

    afterEach(() => {
        clock.restore();
        Object.assign(clock, clocks.pop());
    });
    return clock;
}
