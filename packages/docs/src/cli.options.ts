export const packages = {
    alias: 'p',
    default: 'packages',
    describe: 'workspaces (packages) directory',
    string: true,
};
export const origin = {
    alias: 'o',
    default: 'git remote -v',
    describe: 'git remote origin',
    string: true,
};
export const skipAnalyze = {
    alias: 'a',
    default: false,
    describe: 'Use cache analyzed api',
    boolean: true,
};
export const docs = {
    alias: 'd',
    default: '_docs',
    describe: 'target directory',
    string: true,
};
export const conf = {
    alias: 'c',
    default: 'docs-conf',
    describe: 'index/package/item headers and other configuration',
    string: true,
};
export const base = {
    alias: 'b',
    default: '.',
    describe: 'project root',
    string: true,
};
export const temp = {
    alias: 't',
    default: 'temp',
    describe: 'temp files directory',
    string: true,
};
export const force = {
    alias: 'f',
    default: false,
    describe: 'overwrite existing configuration',
    boolean: true,
};
export const siteUrl = {
    alias: 's',
    default: 'https://<org>.github.io/<repo>',
    describe: `base URL of the project's github pages`,
    string: true,
};

export const examples = {
    alias: 'e',
    default: 'src/test',
    describe: 'examples source root',
    string: true,
};
