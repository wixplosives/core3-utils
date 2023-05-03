import Sinon from 'sinon';

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
export function useSafeFakeTimers(): Sinon.SinonFakeTimers {
    const clocks = [] as Sinon.SinonFakeTimers[];
    const clock = {} as Sinon.SinonFakeTimers;

    beforeEach(() => {
        clocks.push({ ...clock });
        const _clock = Sinon.useFakeTimers();
        Object.assign(clock, _clock);
        clock.tick;
    });

    afterEach(() => {
        clock.restore();
        Object.assign(clock, clocks.pop());
    });
    return clock;
}
