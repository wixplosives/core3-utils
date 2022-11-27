import Sinon from 'sinon';

export function useSafeFakeTimers(): Sinon.SinonFakeTimers {
    const clocks = [] as Sinon.SinonFakeTimers[];
    const clock = {} as Sinon.SinonFakeTimers;

    beforeEach(() => {
        clocks.push({ ...clock });
        const _clock = Sinon.useFakeTimers();
        Object.assign(clock, _clock);
    });

    afterEach(() => {
        clock.restore();
        Object.assign(clock, clocks.pop());
    });
    return clock;
}
