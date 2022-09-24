import Module from 'module';

const originalResolveFilename = (Module as any)._resolveFilename;
let isMapperRegistered = originalResolveFilename === resolveWithMappings;
const registeredMappings: Record<string, string> = {};
function resolveWithMappings(this: void, ...args: any[]) {
    // first argument is the request itself
    const mappedRequest = registeredMappings[args[0]];
    if (mappedRequest) {
        args[0] = mappedRequest;
    }
    return originalResolveFilename.apply(this, args);
}
export function registerMappings(newMappings = {}) {
    if (!isMapperRegistered && (Module as any)._resolveFilename !== resolveWithMappings) {
        (Module as any)._resolveFilename = resolveWithMappings;
        isMapperRegistered = true;
    }
    Object.assign(registeredMappings, newMappings);
}
