import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function listPackages(path: string) {
    return readdirSync(path, { withFileTypes: true })
        .filter((i) => i.isDirectory())
        .filter((i) => existsSync(join(path, i.name, 'package.json')))
        .map((i) => i.name);
}
