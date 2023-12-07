import { DisposalGroup, getGroupConstrainedIndex, GroupConstraints, normalizeConstraints } from './constraints';
import { DisposableItem, DisposablesGroup } from './disposables-group';

export const DEFAULT_GROUP = 'default';
export const DEFAULT_TIMEOUT = 1000;

const createGroup = (name: string): DisposalGroup => ({
    name,
    disposables: new DisposablesGroup(),
});

export type DisposableOptions = {
    /**
     * disposable name, used in error or when timed out
     */
    name: string;
    /**
     * the subject to dispose
     */
    dispose: DisposableItem;
    /**
     * @default DEFAULT_TIMEOUT
     */
    timeout?: number;
    /**
     * disposal group name
     * @default DEFAULT_GROUP
     */
    group?: string;
};

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
 * const disposables = createDisposables('sample');
 * disposables.add(() => console.log('disposable 1'));
 * disposables.add({dispose: () => console.log('disposable 2')});
 * disposables.dispose();
 * // disposable 2
 * // disposable 1
 * ```
 *
 * @example disposal groups
 * ```ts
 * const disposables = createDisposables('sample');
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
export function createDisposables(name: string, initialGroups: string[] = []) {
    return new Disposables(name, initialGroups);
}

export class Disposables {
    private readonly groups: DisposalGroup[] = [createGroup(DEFAULT_GROUP)];
    private readonly constrains: GroupConstraints[] = [];
    constructor(private name: string, initialGroups: string[] = []) {
        this.groups.push(...initialGroups.map(createGroup));
    }
    /**
     * register a new constrained disposal group
     * @param constraints - constraints for the group must contain {before: groupName} or {after: groupName}
     */
    registerGroup(groupName: string, _constraints: GroupConstraints[] | GroupConstraints) {
        const nConstraints = normalizeConstraints(_constraints, groupName, this.groups);
        const { lastAfter, firstBefore } = getGroupConstrainedIndex(nConstraints, this.groups);
        this.constrains.push(...nConstraints);

        if (lastAfter > 0) {
            this.groups.splice(lastAfter + 1, 0, createGroup(groupName));
        } else {
            this.groups.splice(firstBefore, 0, createGroup(groupName));
        }
    }

    /**
     * @param disposable a function or object with a dispose method
     * @param options if string, will be used as group name
     * @returns a function to remove the disposable
     */

    add(...[nameOrOptions, disposable]: [id: string, disposable: DisposableItem] | [options: DisposableOptions]) {
        if (typeof nameOrOptions === 'string') {
            if (!disposable) {
                throw new Error(
                    `Invalid disposable: must be a function or object with a dispose method got ${disposable}`
                );
            }
            nameOrOptions = { name: nameOrOptions, dispose: disposable };
        }
        const { group: groupName = DEFAULT_GROUP, name, dispose, timeout = DEFAULT_TIMEOUT } = nameOrOptions;
        const group = this.groups.find((g) => g.name === groupName);
        if (!group) {
            throw new Error(`Invalid group: "${groupName}" doesn't exists`);
        }

        group.disposables.add(dispose, timeout, `[${this.name}]: ${name}`);
        return () => group.disposables.remove(dispose);
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
    /**
     * @returns true if the group exists
     */
    hasGroup(groupName: string) {
        return this.groups.some((g) => g.name === groupName);
    }
}
