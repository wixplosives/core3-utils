import yargs from 'yargs/yargs';
import { buildDocs } from './build-docs';
import { createReadme } from './create-readme';
import { init } from './init';

const packages = {
    alias: 'p',
    default: 'packages',
    describe: 'workspaces (packages) directory',
    string: true,
};
const skipAnalyze = {
    alias: 'a',
    default: false,
    describe: 'Use cache analyzed api',
    boolean: true,
};
const docs = {
    alias: 'o',
    default: '_docs',
    describe: 'target directory',
    string: true,
};
const conf = {
    alias: 'c',
    default: 'docs-conf',
    describe: 'index/package/item headers and other configuration',
    string: true,
};
const base = {
    alias: 'b',
    default: '.',
    describe: 'project root',
    string: true,
};
const temp = {
    alias: 't',
    default: 'temp',
    describe: 'temp files directory',
    boolean: true,
};
const force = {
    alias: 'f',
    default: false,
    describe: 'overwrite existing configuration',
    string: true,
};
export const siteUrl = {
    alias: 's',
    default: 'https://<org>.github.io/<repo>',
    describe: `base URL of the project's github pages`,
    string: true,
};

export function cli() {
    yargs(process.argv.slice(2))
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
        .command('build', 'Build doc markdown from packages TSDocs', { conf, skipAnalyze }, ({ conf, skipAnalyze }) => {
            buildDocs(conf, skipAnalyze);
        })
        .command(
            'init',
            'initialize docs config and github pages action',
            { packages, conf, docs, siteUrl, base, temp, force },
            ({ packages, conf, docs, siteUrl, base, temp, force }) => {
                init({ packages, conf, docs, siteUrl, base, temp }, force);
            }
        )
        .command(['readme'], 'create README.md for all the packages', { conf, siteUrl }, ({ conf, siteUrl }) => {
            createReadme(conf, siteUrl);
        })
        .demandCommand()
        .help()
        .parseAsync()
        .catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e);
            process.exit(1);
        });
}
