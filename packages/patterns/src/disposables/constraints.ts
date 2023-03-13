import type { Disposables } from './disposable';

export type GroupConstraints = { before: string; after?: string } | { after: string; before?: string };

export interface DisposalGroup {
    name: string;
    disposables: Disposables;
}

export const getValidatedConstantsGroups = (_constraints: GroupConstraints[], groups: DisposalGroup[]) => {
    let lastAfter = -1,
        firstBefore = Number.MAX_SAFE_INTEGER;
    _constraints.forEach(({ before, after }) => {
        if (before) {
            const index = groups.findIndex((g) => g.name === before);
            if (index === -1) {
                throw new Error(`Invalid constraint: "before: ${before}" - group not found`);
            }
            firstBefore = Math.min(firstBefore, index);
        }
        if (after) {
            const index = groups.findIndex((g) => g.name === after);
            if (index === -1) {
                throw new Error(`Invalid constraint: "after: ${after}" - group not found`);
            }
            lastAfter = Math.max(lastAfter, index);
        }
    });
    if (firstBefore !== Number.MAX_SAFE_INTEGER && lastAfter !== -1) {
        if (lastAfter >= firstBefore) {
            throw new Error(
                `Invalid constraints: ${groups[lastAfter]?.name} runs after ${groups[firstBefore]?.name}, which contradicts prior constraints`
            );
        }
    }
    return { lastAfter, firstBefore };
};

export const normalizeConstraints = (
    constraints: GroupConstraints | GroupConstraints[],
    name: string,
    groups: DisposalGroup[]
) => {
    const _constraints: GroupConstraints[] = Array.isArray(constraints) ? constraints : [constraints];
    if (_constraints.length < 1) {
        throw new Error('Invalid disposal group: must have at least one constraint');
    }
    if (groups.find((g) => g.name === name)) {
        throw new Error(`Invalid group: "${name}" already exists`);
    }
    return _constraints;
};
