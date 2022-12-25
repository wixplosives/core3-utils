/* eslint-disable @typescript-eslint/ban-ts-comment */

const ensureFirst: (() => void)[] = [];
export const setFirstHook = (fn: () => void) => {
    ensureFirst.push(fn);
};

/** safe calls to mocha globals (noop if not running in a mocha environment) */
export const _beforeEach = globalThis.beforeEach ? globalThis.beforeEach : () => void 0;
export const _before = globalThis.before ? globalThis.before : () => void 0;
export const _afterEach = globalThis.afterEach ? globalThis.afterEach : () => void 0;
export const _after = globalThis.after ? globalThis.after : () => void 0;

_before(function () {
    const root = getCtxRoot(this);
    ensureFirst.forEach((h) => goFirst(h, root));
});

export function getCtxRoot(ctx: Mocha.Context) {
    let root = ctx.test?.parent;
    while (root && !root.root) {
        root = root?.parent;
    }
    return root;
}

function goFirst(hookFn: () => void, root: Mocha.Suite | undefined) {
    if (root) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const hook = root._beforeEach.find(({ fn }) => fn === hookFn) as Mocha.Hook;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        root._beforeEach = [hook, ...root._beforeEach.filter((h) => h !== hook)];
    }
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
