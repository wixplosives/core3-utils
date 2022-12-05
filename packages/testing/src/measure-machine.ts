import { sleep } from 'promise-assist';

export async function getIntervalPerformance() {
    performance.mark('intervalStart');
    let intervalCount = 0;
    const interval = setInterval(() => intervalCount++, 5);

    await sleep(209);
    clearInterval(interval);
    performance.mark('intervalEnd');

    const { duration } = performance.measure('interval', 'intervalStart', 'intervalEnd');
    return duration / intervalCount / 5;
}
