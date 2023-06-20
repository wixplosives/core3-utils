import { DisposalGroup, getValidatedConstantsGroups, GroupConstraints, normalizeConstraints } from './constraints';
import { createSimpleDisposable, Disposable } from '.';
import { defaults } from '@wixc3/common';

export const DEFAULT_GROUP = 'default';
export const DEFAULT_TIMEOUT = 10000;

const createGroup = (name: string): DisposalGroup => ({
    name,
    disposables: createSimpleDisposable(),
});

export type DisposableOptions = {
    /**
     * @default DEFAULT_TIMEOUT
     */
    timeout?: number;
    /**
     * disposable name, used in error when timed out
     */
    name?: string;
    /**
     * disposal group name
     * @default DEFAULT_GROUP
     */
    group?: string;
};

let count = 0;
const withDefaults = (d?: DisposableOptions): Required<DisposableOptions> =>
    defaults(d || {}, {
        timeout: DEFAULT_TIMEOUT,
        group: DEFAULT_GROUP,
        name: `unnamed-${count++}`,
    });

/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 *
 * Disposal groups: You can set disposal groups with constraints (before, after)
 * to ensure that disposal groups are disposed in the correct order
 *
 * within each group disposables are disposed in the reverse order they were added
 *
 * @example
 * ```ts
 * const disposables = createDisposables();
 * disposables.add(() => console.log('disposable 1'));
 * disposables.add({dispose: () => console.log('disposable 2')});
 * disposables.dispose();
 * // disposable 2
 * // disposable 1
 * ```
 *
 * @example disposal groups
 * ```ts
 * const disposables = createDisposables();
 * disposables.registerGroup('first', {before: DEFAULT_GROUP});
 * disposables.registerGroup('last', {after: DEFAULT_GROUP});
 * disposables.registerGroup('beforeDefault', {before: DEFAULT_GROUP, after: 'first'});
 * disposables.add(() => console.log('first'), 'first');
 * disposables.add(() => console.log('beforeDefault'), 'beforeDefault');
 * disposables.add(() => console.log('last'), 'last');
 * disposables.add(() => console.log('default'));
 * disposables.dispose();
 * // first
 * // beforeDefault
 * // default
 * // last
 * ```
 */
export function createDisposables() {
    const groups: DisposalGroup[] = [createGroup(DEFAULT_GROUP)];
    return {
        /**
         * register a new constrained disposal group
         * @param constraints - constraints for the group must contain {before: groupName} or {after: groupName}
         */
        registerGroup: (name: string, constraints: GroupConstraints[] | GroupConstraints) => {
            const _constraints: GroupConstraints[] = normalizeConstraints(constraints, name, groups);
            const { lastAfter, firstBefore } = getValidatedConstantsGroups(_constraints, groups);

            if (lastAfter > 0) {
                groups.splice(lastAfter + 1, 0, createGroup(name));
            } else {
                groups.splice(firstBefore, 0, createGroup(name));
            }
        },

        add: (disposable: Disposable, options?: DisposableOptions) => {
            const { group: groupName, name, timeout } = withDefaults(options);
            const group = groups.find((g) => g.name === groupName);
            if (!group) {
                throw new Error(`Invalid group: "${groupName}" doesn't exists`);
            }
            group.disposables.add(disposable, timeout, name);
        },

        /**
         * removes a disposable from all disposal group
         */
        remove: (disposable: Disposable) => {
            groups.forEach((g) => g.disposables.remove(disposable));
        },

        dispose: async () => {
            for (const { disposables } of groups) {
                await disposables.dispose();
            }
        },
    };
}
