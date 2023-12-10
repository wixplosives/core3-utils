import { join } from 'path';
import yargs from 'yargs/yargs';
import { buildDocs } from './build-docs/build-docs';
import { loadConfig, UserConfig } from './common';
import { createReadme } from './create-readme';
import { init } from './init';
import { base, conf, docs, examples, force, origin, packages, siteUrl, skipAnalyze, temp } from './cli.options';
import * as args from './cli.options';
import { validateExamples } from './validate-examples';
import { filter } from '@wixc3/common';

export function cli() {
    yargs(process.argv.slice(2))
        .fail((msg, err, yargs) => {
            // eslint-disable-next-line no-console
            console.log(yargs.help());
        })
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
        .command(
            'build',
            'Build doc markdown from packages TSDocs',
            { conf, base, skipAnalyze },
            ({ base, conf, skipAnalyze }) => {
                try {
                    buildDocs(loadConfig(join(base, conf)), { analyze: !skipAnalyze });
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error((e as Error).stack);
                    process.exit(1);
                }
            },
        )
        .command(
            'init',
            'initialize docs config and github pages action',
            { packages, conf, docs, siteUrl, base, temp, force, origin, examples },
            (params) => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { force, ...rest } = params;
                    const config = Object.fromEntries(
                        filter(Object.entries(rest), ([key, _]) => key in args),
                    ) as UserConfig;
                    init(config, force);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error((e as Error).stack);
                    process.exit(1);
                }
            },
        )
        .command(
            'readme',
            'create README.md for all the packages',
            { conf, base, siteUrl },
            ({ conf, base, siteUrl }) => {
                try {
                    createReadme(loadConfig(join(base, conf)), siteUrl);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error((e as Error).stack);
                    process.exit(1);
                }
            },
        )
        .command('validate', 'validate `@example`s for all the packages', { conf }, ({ conf }) => {
            try {
                validateExamples(loadConfig(conf));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error((e as Error).stack);
                process.exit(1);
            }
        })
        .demandCommand()
        .help()
        .parseSync();
}
