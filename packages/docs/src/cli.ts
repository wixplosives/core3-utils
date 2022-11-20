import { join } from 'path';
import yargs from 'yargs/yargs';
<<<<<<< HEAD
import { buildDocs } from './build-docs/build-docs';
import { loadConfig } from './common';
import { createReadme } from './create-readme';
import { init } from './init';
import { base, conf, docs, force, origin, packages, siteUrl, skipAnalyze, temp } from './cli.options'
=======
import { buildDocs } from './build-docs';
import { loadConfig } from './common';
import { createReadme } from './create-readme';
import { init } from './init';
import { validateExamples } from './validate-examples';

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
const skipValidate = {
    alias: 'v',
    default: false,
    describe: "Don't validate @example tags with refs",
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
const examples = {
    alias: 'e',
    default: 'src/temp',
    describe: 'examples source root',
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
    boolean: true,
};
export const siteUrl = {
    alias: 's',
    default: 'https://<org>.github.io/<repo>',
    describe: `base URL of the project's github pages`,
    string: true,
};
>>>>>>> 6658699 (added @example validation)

export function cli() {
    yargs(process.argv.slice(2))
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
<<<<<<< HEAD
        .command('build', 'Build doc markdown from packages TSDocs', { conf, base, skipAnalyze }, ({ base, conf, skipAnalyze }) => {
            buildDocs(loadConfig(join(base, conf)), { analyze: !skipAnalyze });
        })
        .command(
            'init',
            'initialize docs config and github pages action',
            { packages, conf, docs, siteUrl, base, temp, force, origin },
            ({ packages, conf, docs, siteUrl, base, temp, force, origin }) => {
                init({ packages, conf, docs, siteUrl, base, temp, origin }, force);
            }
        )
        .command('readme', 'create README.md for all the packages', { conf, base, siteUrl }, ({ conf, base, siteUrl }) => {
            createReadme(loadConfig(join(base, conf)), siteUrl);
=======
        .command('build', 'Build doc markdown from packages TSDocs',
            { conf, skipAnalyze, skipValidate },
            ({ conf, skipAnalyze, skipValidate }) => {
                buildDocs(conf, skipAnalyze, skipValidate);
            })
        .command(
            'init',
            'initialize docs config and github pages action',
            { examples, packages, conf, docs, siteUrl, base, temp, force },
            ({ examples, packages, conf, docs, siteUrl, base, temp, force }) => {
                init({ examples, packages, conf, docs, siteUrl, base, temp }, force);
            }
        )
        .command('validate', 'create README.md for all the packages', { conf }, ({ conf }) => {
            const config = loadConfig(conf)

            validateExamples(config);
        })
        .command('readme', 'create README.md for all the packages', { conf, siteUrl }, ({ conf, siteUrl }) => {
            createReadme(conf, siteUrl);
>>>>>>> 6658699 (added @example validation)
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
