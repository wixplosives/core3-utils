import yargs from 'yargs/yargs'
import { buildDocs } from './build-docs'
import { createReadme } from './create-readme'
import { init } from './init'

const packages = {
    alias: 'p',
    default: 'packages',
    describe: 'workspaces (packages) directory',
    string: true
}
const output = {
    alias: 'o',
    default: '_docs',
    describe: 'target directory',
    string: true
}
const conf = {
    alias: 'c',
    default: 'docs-conf',
    describe: 'index/package/item headers and other configuration',
    string: true
}

export function cli() {
    yargs(process.argv.slice(2))
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
        .command('build', 'Build doc markdown from packages TSDocs',
            { output, packages, headers: conf },
            async ({ output, packages, headers }) => {
                await buildDocs(packages, output, headers)
            })
        .command('init', 'initialize docs config and github pages action',
            { packages, headers: conf },
            async ({ packages, headers} ) => {
                await init(packages, headers)
            })
        .command(['readme', '<siteUrl>'], 'create README.md for all the packages',
            { docs: output, packages },
            async (args) => {
                if (!args._[1]) {
                    // eslint-disable-next-line no-console
                    console.error('siteUrl arg is required');
                    process.exit(2);
                }
                await createReadme(args._[1] as string, args.docs, args.packages)
            }
        )
        .demandCommand()
        .help()
        .parseAsync().catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            process.exit(1);
        })
}