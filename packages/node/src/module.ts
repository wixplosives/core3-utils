import Module from 'module';
type M = typeof Module & { _resolveFilename: (...args: unknown[]) => string };

const originalResolveFilename = (Module as M)._resolveFilename;
let isMapperRegistered = originalResolveFilename === resolveWithMappings;
const registeredMappings: Record<string, string> = {};
function resolveWithMappings(this: void, ...args: unknown[]) {
    // first argument is the request itself
    const mappedRequest = registeredMappings[args[0] as string];
    if (mappedRequest) {
        args[0] = mappedRequest;
    }
    return originalResolveFilename.apply(this, args);
}
export function registerMappings(newMappings = {}) {
    if (!isMapperRegistered && (Module as M)._resolveFilename !== resolveWithMappings) {
        (Module as M)._resolveFilename = resolveWithMappings;
        isMapperRegistered = true;
    }
    Object.assign(registeredMappings, newMappings);
}
