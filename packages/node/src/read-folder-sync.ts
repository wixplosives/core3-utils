import type { IDirectoryContents, IFileSystem } from '@file-services/types';
import { nodeFs } from '@file-services/node';

export function readFolderSync(fs: IFileSystem, folderPath: string): IDirectoryContents {
    const dirKeys = fs.readdirSync(folderPath);
    return dirKeys.reduce((folder, fileOrDir) => {
        const itemPath = fs.join(folderPath, fileOrDir);
        const s = fs.statSync(itemPath);
        if (s.isDirectory()) {
            folder[fileOrDir] = readFolderSync(fs, itemPath);
        } else {
            folder[fileOrDir] = fs.readFileSync(itemPath, 'utf8').replace(/\r\n/g, '\n');
        }
        return folder;
    }, {} as IDirectoryContents);
}

export function readFolderSyncNode(fromFileName: string, relativeFolderPath: string): IDirectoryContents {
    const folderPath = nodeFs.join(fromFileName, nodeFs.normalize(relativeFolderPath));
    return readFolderSync(nodeFs, folderPath);
}
