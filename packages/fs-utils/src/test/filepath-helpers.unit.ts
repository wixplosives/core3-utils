import { createMemoryFs } from '@file-services/memory';
import { expect } from 'chai';
import {
    backSlash,
    getFullExtname,
    getImportPath,
    getRelativeImportPath,
    isPathIncludesDir,
    isSubPath,
    rebaseRelativeModulePath,
} from '../index.js';

describe('getRelativeImportPath', () => {
    it('should create relative path', () => {
        expect(getRelativeImportPath('/user/dir/component.tsx', '/user/file.jsx')).to.equal('../file');
    });

    it('should add ./ to a file in the same directory', () => {
        expect(getRelativeImportPath('/user/component.js', '/user/file.jsx')).to.equal('./file');
    });

    it('should leave other extentions', () => {
        expect(getRelativeImportPath('/user/component.tsx', '/user/file.css')).to.equal('./file.css');
    });

    it('should work with absolute paths', () => {
        expect(getRelativeImportPath('/user/component', '/imported/file')).to.equal('../imported/file');
    });

    it('should work with windows paths', () => {
        expect(getRelativeImportPath('C:\\user\\dir\\component.tsx', 'C:\\user\\file.jsx')).to.equal('../file');
    });
});

it('checks if one path is a child of another', () => {
    const fs = createMemoryFs({});
    expect(isSubPath('/Users/dir', '/Users/dir', fs)).to.equal(true);
    expect(isSubPath('/Users/dir', '/Users', fs)).to.equal(true);
    expect(isSubPath('/Users', '/Users/dir', fs)).to.equal(false);
    expect(isSubPath('/Users/dir', '/Users/foo', fs)).to.equal(false);
    expect(isSubPath('/Users', '/Bar', fs)).to.equal(false);
    expect(isSubPath('/', '/', fs)).to.equal(true);
    expect(isSubPath('/FOO/BAR', '/foo', fs)).to.equal(false);
});

describe('isPathIncludesDir', function () {
    it('Posix paths', function () {
        expect(isPathIncludesDir('/Users/dir/file.js', 'dir')).to.equal(true);
        expect(isPathIncludesDir('/Users/dir', 'Users')).to.equal(true);
        expect(isPathIncludesDir('/Users', '/Bar')).to.equal(false);
        expect(isPathIncludesDir('/FOO/BAR', '/foo')).to.equal(false);
    });
    it('Windows paths', function () {
        expect(isPathIncludesDir('C:\\Users\\dir\\file.js', 'dir')).to.equal(true);
        expect(isPathIncludesDir('C:\\Users\\dir', 'Users')).to.equal(true);
        expect(isPathIncludesDir('C:\\Users', 'Bar')).to.equal(false);
    });
});

describe('extensions and import paths', () => {
    it('gets correct file extensions', () => {
        expect(getFullExtname('@wixc3/some-package')).to.equal('');
        expect(getFullExtname('@wixc3/some-package/k.ts')).to.equal('.ts');
        expect(getFullExtname('../ab/cd.ts')).to.equal('.ts');
        expect(getFullExtname('../ab/cd.tsx')).to.equal('.tsx');
        expect(getFullExtname('../ab/cd.skin.ts')).to.equal('.skin.ts');
        expect(getFullExtname('../ab/cd.skin.d.ts')).to.equal('.skin.d.ts');
        expect(getFullExtname('../ab/cd.skin.tsx')).to.equal('.skin.tsx');
        expect(getFullExtname('/ab/cd.ts')).to.equal('.ts');
        expect(getFullExtname('/ab/cd.tsx')).to.equal('.tsx');
        expect(getFullExtname('/ab/cd.skin.ts')).to.equal('.skin.ts');
        expect(getFullExtname('/ab/cd.skin.tsx')).to.equal('.skin.tsx');
    });

    it('gets correct import paths', () => {
        expect(getImportPath('@wixc3/some-package')).to.equal('@wixc3/some-package');
        expect(getImportPath('@wixc3/some-package/k.ts')).to.equal('@wixc3/some-package/k');
        expect(getImportPath('../ab/cd.ts')).to.equal('../ab/cd');
        expect(getImportPath('../ab/cd.tsx')).to.equal('../ab/cd');
        expect(getImportPath('../ab/cd.skin.ts')).to.equal('../ab/cd.skin');
        expect(getImportPath('../ab/cd.skin.d.ts')).to.equal('../ab/cd.skin');
        expect(getImportPath('../ab/cd.skin.tsx')).to.equal('../ab/cd.skin');
        expect(getImportPath('/ab/cd.ts')).to.equal('/ab/cd');
        expect(getImportPath('/ab/cd.tsx')).to.equal('/ab/cd');
        expect(getImportPath('/ab/cd.skin.ts')).to.equal('/ab/cd.skin');
        expect(getImportPath('/ab/cd.skin.tsx')).to.equal('/ab/cd.skin');
    });
});

describe('rebaseRelativeModulePath()', () => {
    describe('posix', () => {
        it('rebase path from same folder', () => {
            expect(rebaseRelativeModulePath('/src/a.ts', '/src/b.ts')).to.equal('./b.ts');
        });

        it('rebase path from sub folder', () => {
            expect(rebaseRelativeModulePath('/src/a.ts', '/src/dir/b.ts')).to.equal('./dir/b.ts');
        });

        it('rebase path from parent folder', () => {
            expect(rebaseRelativeModulePath('/src/a.ts', '/b.ts')).to.equal('../b.ts');
        });

        it('rebase module path', () => {
            expect(rebaseRelativeModulePath('/src/a.ts', '@wixc3/some-package')).to.equal('@wixc3/some-package');
        });
    });
    describe('windows', () => {
        it('rebase path from same folder', () => {
            expect(rebaseRelativeModulePath('C:/src/a.ts', 'C:/src/b.ts')).to.equal('./b.ts');
        });

        it('rebase path from sub folder', () => {
            expect(rebaseRelativeModulePath('C:/src/a.ts', 'C:/src/dir/b.ts')).to.equal('./dir/b.ts');
        });

        it('rebase path from parent folder', () => {
            expect(rebaseRelativeModulePath('C:/src/a.ts', 'C:/b.ts')).to.equal('../b.ts');
        });

        it('rebase module path', () => {
            expect(rebaseRelativeModulePath('C:/src/a.ts', '@wixc3/some-package')).to.equal('@wixc3/some-package');
        });
    });
});

describe('backSlash', () => {
    it('removes multiple heading slashes', () => {
        expect(backSlash('////file.name', 'none')).to.equal('file.name');
        expect(backSlash('////file.name', 'heading')).to.equal('/file.name');
        expect(backSlash('////file.name', 'trailing')).to.equal('file.name/');
        expect(backSlash('////file.name', 'both')).to.equal('/file.name/');
    });
    it('removes multiple trailing slashes', () => {
        expect(backSlash('file.name////', 'none')).to.equal('file.name');
        expect(backSlash('file.name////', 'heading')).to.equal('/file.name');
        expect(backSlash('file.name////', 'trailing')).to.equal('file.name/');
        expect(backSlash('file.name////', 'both')).to.equal('/file.name/');
    });
    it('keeps slashes in the middle', () => {
        expect(backSlash('file/name', 'none')).to.equal('file/name');
        expect(backSlash('file/name', 'heading')).to.equal('/file/name');
        expect(backSlash('file/name', 'trailing')).to.equal('file/name/');
        expect(backSlash('file/name', 'both')).to.equal('/file/name/');
    });
    it('handles no slashes', () => {
        expect(backSlash('file.name', 'none')).to.equal('file.name');
        expect(backSlash('file.name', 'heading')).to.equal('/file.name');
        expect(backSlash('file.name', 'trailing')).to.equal('file.name/');
        expect(backSlash('file.name', 'both')).to.equal('/file.name/');
    });
});
