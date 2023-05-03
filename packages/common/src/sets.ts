export const addToSet = <T>(target: Set<T>, source: Set<T>) => {
    for (const item of source) {
        target.add(item);
    }
};
