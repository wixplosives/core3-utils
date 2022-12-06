import { deferred } from 'promise-assist';

export async function getIntervalPerformance() {
    performance.mark('intervalStart');
    let intervalCount = 0;

    const count = 20,
        size = 1000,
        intervalTime = 5,
        ideaTime = intervalTime * count;

    const done = deferred();
    const interval = setInterval(() => {
        if (++intervalCount > count) {
            done.resolve();
        }
    }, intervalTime);

    const busyBoxes = [];
    const bbResults: number[] = [];
    for (let i = 0; i < count * intervalTime * 10; i++) {
        busyBoxes[i] = setTimeout(() => {
            const a = new Array(size).fill(0).map(() => Math.random());
            bbResults.push(a.sort().reduce((sum, n) => sum + n, 0));
        }, i);
    }

    await done.promise;
    busyBoxes.forEach((b) => clearTimeout(b));

    clearInterval(interval);
    performance.mark('intervalEnd');

    const { duration } = performance.measure('interval', 'intervalStart', 'intervalEnd');
    return duration / ideaTime;
}
