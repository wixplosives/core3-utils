const ensureFirst: (() => void)[] = [];
export const setFirstHook = (fn: () => void) => {
    ensureFirst.push(fn);
};

export function getCtxRoot(ctx: Mocha.Context) {
    let root = ctx.test?.parent;
    while (root && !root.root) {
        root = root?.parent;
    }
    return root;
}

export function* getMochaRunnables(root?: Mocha.Suite): Generator<Mocha.Runnable> {
    for (const val of Object.values(root as object)) {
        if (Array.isArray(val)) {
            for (const v of val) {
                if (typeof (v as { fn: any }).fn === 'function') {
                    yield v as Mocha.Runnable;
                } else {
                    yield* getMochaRunnables(v as Mocha.Suite);
                }
            }
        }
    }
}
