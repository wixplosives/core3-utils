import type { IFileSystem } from '@file-services/types';
import type { PackageJson } from 'type-fest';
import { isPlainObject } from '@wixc3/common';

/**
 * Read and parse a directory's package.json
 * @param dirPath - an absolute path to a directory containing package.json
 * @param fs - file system
 * @returns
 */
export function readPackageJson(dirPath: string, fs: IFileSystem): PackageJson {
    const packageJsonContent = fs.readFileSync(fs.join(dirPath, 'package.json'), 'utf8');
    try {
        const packageJson = JSON.parse(packageJsonContent) as PackageJson;
        if (isPlainObject(packageJson)) {
            // this is the only valid options, otherwise throw
            return packageJson;
        }
    } catch {
        //
    }
    throw new Error(`Invalid package.json at ${dirPath}`);
}

/**
 * Gets package name.
 *
 * @param dirPath - an absolute path to a directory containing package.json
 * @param fs - file system
 */
export function getPackageName(dirPath: string, fs: IFileSystem): string | undefined {
    return readPackageJson(dirPath, fs).name;
}

/**
 * Gets path to package.json file closest to the given file path.
 *
 * @param filePath - a file path
 * @param fs - file system
 */
export function getPackageJsonPath(filePath: string, fs: IFileSystem): string | undefined {
    return fs.findClosestFileSync(filePath, 'package.json');
}

/**
 * Gets path to package directory, closest to the given file path.
 */
export function getPackagePath(filePath: string, fs: IFileSystem): string | undefined {
    const packageJsonPath = getPackageJsonPath(filePath, fs);
    return packageJsonPath ? fs.dirname(packageJsonPath) : undefined;
}
