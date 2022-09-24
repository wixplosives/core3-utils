import type { IFileSystem } from '@file-services/types';

/**
 * Gets package name.
 *
 * @param pathToPackageJson a package.json absolute path
 * @param fs file system
 */
export function getPackageName(pathToPackageJson: string, fs: IFileSystem): string | undefined {
    try {
        const { name } = JSON.parse(fs.readFileSync(pathToPackageJson, 'utf8'));
        if (!name || typeof name !== 'string') {
            return undefined;
        }
        return name;
    } catch {
        return undefined;
    }
}
