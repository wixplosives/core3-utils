import type { IFileSystem } from '@file-services/types';

/**
 * Returns case-exact absolute form of the path, similar to fs.realpathSync.native()
 * Trailing segments of the path that don't exist are left unchanged.
 */
export function pathToTrueCase(fs: IFileSystem, path: string): string {
    const resolvedPath = fs.resolve(path);

    if (fs.caseSensitive) {
        return resolvedPath;
    }

    const parts = splitPath(fs, resolvedPath);
    for (let i = 1; i < parts.length; i++) {
        const parentPath = fs.join(...parts.slice(0, i));
        const trueName = fileNameToTrueCase(fs, parentPath, parts[i]!);
        if (!trueName) {
            break;
        }
        parts[i] = trueName;
    }
    return fs.join(...parts);
}

/**
 * Given a directory path, a file name in that directory, returns the case-exact
 * form of that filename. If the file or directory doesn't exist, returns undefined.
 */
function fileNameToTrueCase(fs: IFileSystem, dirPath: string, fileName: string): string | undefined {
    if (fs.caseSensitive) {
        const filePath = fs.join(dirPath, fileName);
        return fs.existsSync(filePath) ? fileName : undefined;
    }

    try {
        const fileNameLower = fileName.toLowerCase();
        return fs.readdirSync(dirPath).find((f) => f.toLowerCase() === fileNameLower);
    } catch {
        return;
    }
}

/**
 * Splits a path into segments, opposite of path.join()
 */
function splitPath(fs: IFileSystem, path: string): string[] {
    const parts = [];
    for (;;) {
        const basename = fs.basename(path);
        if (path === '' || path === '.' || path === '..' || basename === '') {
            parts.unshift(path || '.');
            return parts;
        }
        parts.unshift(basename);
        path = fs.dirname(path);
    }
}
