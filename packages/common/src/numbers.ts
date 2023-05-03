export function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

export function normToRage(normal: number, min: number, max: number) {
    return normal * (max - min) + min;
}

export function mulberry32(a = 0) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function createRandomIntWithSeed(seed: number) {
    const nextRandomFloat = mulberry32(seed);
    const randInt = (min: number, max: number) => Math.floor(normToRage(nextRandomFloat(), min, max));
    return randInt;
}

export const seededRandomInt = createRandomIntWithSeed(1);
