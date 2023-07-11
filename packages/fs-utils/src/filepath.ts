import { posix as posixPath, win32 as win32Path, extname } from '@file-services/path';
import type { IFileSystem } from '@file-services/types';
import { getPackageJsonPath, getPackageName } from './package-json';

export const replaceWinSlashes = (str: string) => str.replace(/\\/g, '/');
export const formatToOSpaths = (str: string) => {
    if (isWindowsStyleAbsolutePath(str)) {
        return str.replace(/\//g, '\\');
    }
    return str;
};

export interface AdjustRelativeImportPathArgs {
    importPath: string;
    sourceFilePath: string;
    targetFilePath: string;
    targetPackageJsonPath: string | undefined;
    fs: IFileSystem;
}

export interface CreateImportPathArgs {
    importedFilePath: string;
    targetFilePath: string;
    targetPackageJsonPath: string | undefined;
    fs: IFileSystem;
}

// https://www.typescriptlang.org/docs/handbook/module-resolution.html
export function isRelativeModulePath(path: string) {
    return path.startsWith('./') || path.startsWith('../') || path.startsWith('/');
}

export function isRelativeModuleRequest(request: string) {
    return request === '.' || request === '..' || request.startsWith('./') || request.startsWith('../');
}

export function addRelativePrefix(path: string) {
    if (isRelativeModulePath(path)) {
        return path;
    }
    return `./${path}`;
}

/**
 * @param filePath - full posix path of the file which about to import from `modulePath`
 * @param modulePath - full posix path of the imported module
 * @returns the relative posix path from `filePath` to `modulePath`
 */
export function rebaseRelativeModulePath(filePath: string, modulePath: string): string {
    if (!isRelativeModulePath(modulePath) && !isWindowsStyleAbsolutePath(modulePath)) {
        return modulePath;
    }
    const relativePath = posixPath.relative(posixPath.dirname(filePath), modulePath);
    return addRelativePrefix(relativePath);
}

export function getRelativeModulePath(sourceAbsFilePath: string, targetAbsFilePath: string) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { relative, dirname } = win32Path;
    return addRelativePrefix(replaceWinSlashes(relative(dirname(sourceAbsFilePath), targetAbsFilePath)));
}

/**
 * Creates relative import path for a file, stripping extension from JS/TS files.
 *
 * @param sourceFilePath - the file path of the component source code to be modified by new import lines
 * @param filePathToImport - the file path to be imported into the source file
 */
export function getRelativeImportPath(sourceFilePath: string, filePathToImport: string): string {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { relative, dirname } = posixPath;
    const newImportPath = getImportPath(
        relative(dirname(replaceWinSlashes(sourceFilePath)), replaceWinSlashes(filePathToImport))
    );
    return isRelativeModuleRequest(newImportPath) ? newImportPath : `./${newImportPath}`;
}

/**
 * Creates bare import specifier for an absolute import path, stripping extension from JS/TS files.
 *
 * @param absoluteImportPath - an absolute import path
 * @param packageJsonPath - package.json file path
 * @param packageJsonName - package name
 */
export function getBareImportSpecifier(
    absoluteImportPath: string,
    packageJsonPath: string,
    packageJsonName: string
): string {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { dirname } = posixPath;
    return getImportPath(
        replaceWinSlashes(absoluteImportPath).replace(dirname(replaceWinSlashes(packageJsonPath)), packageJsonName)
    );
}

/**
 * Returns relative import path if imported and target files are in the same package, otherwise returns a bare import specifier.
 *
 * @param importedFilePath - an absolute path of imported file
 * @param targetFilePath - an absolute path of the file to which import will be added
 * @param targetPackageJsonPath - absolute file path to the target package.json
 * @param fs - file system
 */
export function createImportPath({
    importedFilePath,
    targetFilePath,
    targetPackageJsonPath,
    fs,
}: CreateImportPathArgs): string {
    const importPackageJsonPath = getPackageJsonPath(importedFilePath, fs);
    const importPackageJsonName = importPackageJsonPath
        ? getPackageName(fs.dirname(importPackageJsonPath), fs)
        : undefined;

    if (importPackageJsonPath === targetPackageJsonPath || !importPackageJsonPath || !importPackageJsonName) {
        return getRelativeImportPath(targetFilePath, importedFilePath);
    } else {
        return getBareImportSpecifier(importedFilePath, importPackageJsonPath, importPackageJsonName);
    }
}

/**
 * Checks if a path is equal to or subpath of a given base path.
 */
export function isSubPath(path: string, basePath: string, fs: IFileSystem): boolean {
    if (!fs.isAbsolute(path) || !fs.isAbsolute(basePath)) {
        return false;
    }
    const relativePath = fs.relative(basePath, path);
    return relativePath === '' || (!relativePath.startsWith('..') && !fs.isAbsolute(relativePath));
}

/**
 * prefix for file requests in Language server protocol
 */
export const fileRequestPrefix = 'file://';

/**
 * @param currentPath - absolute path to yield parent directory path from
 */
export function* pathChainToRoot(currentPath: string) {
    let lastPath: string | undefined;
    while (lastPath !== currentPath) {
        yield currentPath;
        lastPath = currentPath;
        currentPath = win32Path.dirname(currentPath);
    }
}

/**
 * Safely checks if a path contains a directory name.
 * @param filePath - absolute path to a file
 * @param directoryName - directory to check if included as dir inside the file path
 * @returns boolean indicating if filePath includes directoryName
 */
export function isPathIncludesDir(filePath: string, directoryName: string) {
    for (const pathPart of pathChainToRoot(filePath)) {
        if (directoryName === win32Path.basename(pathPart)) {
            return true;
        }
    }
    return false;
}

export function isWindowsStyleAbsolutePath(fsPath: string): boolean {
    return !posixPath.isAbsolute(fsPath) && win32Path.isAbsolute(fsPath);
}

/**
 * Returns file extension from the first occurrence of the ".",
 * unlike path.extname() which returns from the last occurrence.
 * @example
 * ```ts
 *   getFullExtname('/dir/my-component.st.css') // => '.st.css'
 * ```
 */
export function getFullExtname(filePath: string) {
    let basePath = filePath;
    const totalExtParts: string[] = [];
    let ext = win32Path.extname(basePath);
    while (ext && ext.length > 0) {
        totalExtParts.unshift(ext);
        basePath = basePath.slice(0, -ext.length);
        ext = win32Path.extname(basePath);
    }
    return totalExtParts.join('');
}

export function getImportPath(filePath: string) {
    const extensions = ['.d.ts', '.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
        if (filePath.endsWith(ext)) {
            return filePath.slice(0, -ext.length);
        }
    }
    return filePath;
}

export const isJsonFile = (filePath: string) => filePath.endsWith('.json');
export const isTypeScriptFile = (filePath: string) => filePath.endsWith('.ts') || filePath.endsWith('.tsx');
export const isJavaScriptFile = (filePath: string) =>
    filePath.endsWith('.js') || filePath.endsWith('.jsx') || filePath.endsWith('.mjs') || filePath.endsWith('.cjs');
export const isDirPath = (filePath: string) => extname(filePath).length === 0;
export const isTypeAffectingFileOrDir = (filePath: string) =>
    isJsonFile(filePath) || isTypeScriptFile(filePath) || isJavaScriptFile(filePath) || isDirPath(filePath);
export const isTsOrJS = (filePath: string) => {
    return isTypeScriptFile(filePath) || isJavaScriptFile(filePath);
};

export const getDTSPath = (filePath: string) => {
    if (filePath.endsWith('.js')) {
        filePath = filePath.slice(0, filePath.length - 3);
    } else if (filePath.endsWith('.jsx')) {
        filePath = filePath.slice(0, filePath.length - 4);
    }
    return filePath + '.d.ts';
};

/**
 * Ensure a single heading/trailing backslash (/) of a single line string
 * @param type - 'heading'|'trailing'|'both'|'none'
 */
export function backSlash(str: string, type: 'heading' | 'trailing' | 'both' | 'none') {
    const s = str.replace(/^\/+|\/+$/, '');
    switch (type) {
        case 'both':
            return `/${s}/`;
        case 'trailing':
            return `${s}/`;
        case 'heading':
            return `/${s}`;
        default:
            return s;
    }
}
