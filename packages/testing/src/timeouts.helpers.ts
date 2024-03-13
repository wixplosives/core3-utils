const WAS_ADJUSTED = Symbol('__timeoutWasAdjusted');
export function isAdjustedTimeout<T extends object>(x: T) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!(x as any)[WAS_ADJUSTED];
}
export function markAdjustedTimeout<T extends { timeout: number } & object>(x: T) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (x as any)[WAS_ADJUSTED] = true;
    return x;
}
