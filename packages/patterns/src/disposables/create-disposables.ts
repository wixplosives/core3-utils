import { DisposalGroup, getGroupConstrainedIndex, GroupConstraints, normalizeConstraints } from './constraints';
import { DisposableItem, DisposablesGroup } from './disposables-group';
import { defaults } from '@wixc3/common';

export const DEFAULT_GROUP = 'default';
export const DEFAULT_TIMEOUT = 1000;

const createGroup = (name: string): DisposalGroup => ({
    name,
    disposables: new DisposablesGroup(),
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
export function createDisposables(allowUnnamedDisposables = true) {
    return new Disposables(allowUnnamedDisposables);
}

export class Disposables {
    private readonly groups: DisposalGroup[] = [createGroup(DEFAULT_GROUP)];
    private readonly constrains: GroupConstraints[] = [];

    constructor(readonly allowUnnamedDisposables = true) {}

    /**
     * register a new constrained disposal group
     * @param constraints - constraints for the group must contain {before: groupName} or {after: groupName}
     */
    registerGroup(name: string, _constraints: GroupConstraints[] | GroupConstraints) {
        const nConstraints = normalizeConstraints(_constraints, name, this.groups);
        const { lastAfter, firstBefore } = getGroupConstrainedIndex(nConstraints, this.groups);
        this.constrains.push(...nConstraints);

        if (lastAfter > 0) {
            this.groups.splice(lastAfter + 1, 0, createGroup(name));
        } else {
            this.groups.splice(firstBefore, 0, createGroup(name));
        }
    }

    /**
     * @param disposable a function or object with a dispose method
     * @param options if string, will be used as group name
     * @returns a function to remove the disposable
     */
    add(disposable: DisposableItem, options?: DisposableOptions | string) {
        if (typeof options === 'string') {
            options = { group: options };
        }
        const { group: groupName, name, timeout } = withDefaults(options);
        const group = this.groups.find((g) => g.name === groupName);
        if (!group) {
            throw new Error(`Invalid group: "${groupName}" doesn't exists`);
        }
        group.disposables.add(disposable, timeout, name);
        return () => group.disposables.remove(disposable);
    }

    /**
     * removes a disposable from all disposal group
     */
    remove(disposable: DisposableItem) {
        this.groups.forEach((g) => {
            try {
                g.disposables.remove(disposable);
            } catch (e) {
                if ((e as Error)?.message !== 'Disposable not found') {
                    throw e;
                }
            }
        });
    }

    /**
     * Disposes all disposables in all groups one at the time,
     * order based on constraints
     */
    dispose = async () => {
        for (const { disposables } of this.groups) {
            await disposables.dispose();
        }
    };

    /**
     *
     * @returns a serialized list of groups and their disposables and constraints
     */
    list() {
        const groups = this.groups.map((g) => {
            const { name } = g;
            const disposables = g.disposables.list();
            return {
                name,
                disposables,
                totalTimeout: disposables.reduce((acc, d) => acc + d.timeout, 0),
            };
        });
        return {
            constrains: this.constrains.map((c) => ({ ...c })),
            groups,
            totalTimeout: groups.reduce((acc, g) => acc + g.totalTimeout, 0),
        };
    }
}
