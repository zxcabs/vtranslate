export const enum DirEntryType {
    Directory = 'directory',
    File = 'file'
}

export interface DirEntryDirectory {
    name: string;
    parentPath: string;
    type: DirEntryType.Directory;
}

export interface DirEntryFile {
    name: string;
    parentPath: string;
    type: DirEntryType.File;
    mime: string;
}

export type DirEntry = DirEntryDirectory | DirEntryFile;