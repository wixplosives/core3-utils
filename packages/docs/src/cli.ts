import { join } from 'path';
import yargs from 'yargs/yargs';
import { buildDocs } from './build-docs/build-docs';
import { loadConfig } from './common';
import { createReadme } from './create-readme';
import { init } from './init';
import { base, conf, docs, force, origin, packages, siteUrl, skipAnalyze, temp } from './cli.options'

export function cli() {
    yargs(process.argv.slice(2))
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
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
