import { createDisposables, Disposable, Disposables } from '@wixc3/patterns';

interface DisposalGroup {
    name: string;
    disposables: Disposables;
}

const createGroup = (name: string): DisposalGroup => ({
    name,
    disposables: createDisposables(),
});

export type GroupConstraints = { before: string; after?: string } | { after: string; before?: string };

export class DisposalGroups {
    static readonly DEFAULT_GROUP = 'default';
    private groups: DisposalGroup[] = [createGroup(DisposalGroups.DEFAULT_GROUP)];

    registerGroup(name: string, constraints: GroupConstraints[] | GroupConstraints) {
        const _constraints: GroupConstraints[] = this.normalizeConstraints(constraints, name);
        const { lastAfter, firstBefore } = this.getValidatedConstantsGroups(_constraints);

        if (lastAfter > 0) {
            this.groups.splice(lastAfter + 1, 0, createGroup(name));
        } else {
            this.groups.splice(firstBefore, 0, createGroup(name));
        }
    }

    private getValidatedConstantsGroups(_constraints: GroupConstraints[]) {
        let lastAfter = -1,
            firstBefore = Number.MAX_SAFE_INTEGER;
        _constraints.forEach(({ before, after }) => {
            if (before) {
                const index = this.groups.findIndex((g) => g.name === before);
                if (index === -1) {
                    throw new Error(`Invalid constraint: "before: ${before}" - group not found`);
                }
                firstBefore = Math.min(firstBefore, index);
            }
            if (after) {
                const index = this.groups.findIndex((g) => g.name === after);
                if (index === -1) {
                    throw new Error(`Invalid constraint: "after: ${after}" - group not found`);
                }
                lastAfter = Math.max(lastAfter, index);
            }
        });
        if (firstBefore !== Number.MAX_SAFE_INTEGER && lastAfter !== -1) {
            if (lastAfter >= firstBefore) {
                throw new Error(
                    `Invalid constraints: ${this.groups[lastAfter]?.name} runs after ${this.groups[firstBefore]?.name}, which contradicts prior constraints`
                );
            }
        }
        return { lastAfter, firstBefore };
    }

    private normalizeConstraints(constraints: GroupConstraints | GroupConstraints[], name: string) {
        const _constraints: GroupConstraints[] = Array.isArray(constraints) ? constraints : [constraints];
        if (_constraints.length < 1) {
            throw new Error('Invalid disposal group: must have at least one constraint');
        }
        if (this.groups.find((g) => g.name === name)) {
            throw new Error(`Invalid group: "${name}" already exists`);
        }
        return _constraints;
    }

    addToGroup(disposable: Disposable, name: string) {
        const group = this.groups.find((g) => g.name === name);
        if (!group) {
            throw new Error(`Invalid group: "${name}" doesn't exists`);
        }
        group.disposables.add(disposable);
    }

    dispose = async () => {
        for (const { disposables } of this.groups) {
            await disposables.dispose();
        }
    };
}
