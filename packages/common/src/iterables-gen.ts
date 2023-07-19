export function* times(count: number, start = 0, step = 1) {
    for (let i = start; i < count; i += step) {
        yield i;
    }
}
