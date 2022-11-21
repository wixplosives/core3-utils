import { join } from 'path';
import yargs from 'yargs/yargs';
import { buildDocs } from './build-docs/build-docs';
import { loadConfig, UserConfig } from './common';
import { createReadme } from './create-readme';
import { init } from './init';
import { base, conf, docs, examples, force, origin, packages, siteUrl, skipAnalyze, temp } from './cli.options'
import * as args from './cli.options'
import { validateExamples } from './validate-examples';
import { filter } from '@wixc3/common';

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
            { packages, conf, docs, siteUrl, base, temp, force, origin, examples },
            (params) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { force, ...rest } = params;
                const config = Object.fromEntries(
                    filter(Object.entries(rest), ([key, _]) => key in args)) as UserConfig
                init(config, force);
            }
        )
        .command('readme', 'create README.md for all the packages', { conf, base, siteUrl }, ({ conf, base, siteUrl }) => {
            createReadme(loadConfig(join(base, conf)), siteUrl);
        })
        .command('validate', 'create README.md for all the packages', { conf }, ({ conf }) => {
            validateExamples(loadConfig(conf));
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
