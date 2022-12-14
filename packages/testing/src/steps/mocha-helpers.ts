/* eslint-disable @typescript-eslint/ban-ts-comment */

const ensureFirst: (() => void)[] = [];
export const setFirstHook = (fn: () => void) => {
    ensureFirst.push(fn);
};

before(function () {
    const root = getCtxRoot(this);
    ensureFirst.forEach((h) => goFirst(h, root));
});

function getCtxRoot(ctx: Mocha.Context) {
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
