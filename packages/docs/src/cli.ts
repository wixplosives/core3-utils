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
const indexHeaderPath = {
    alias: 'o',
    default: 'README.base.md',
    describe: 'main site index header in markdown format',
    string: true
}




export function cli() {
    yargs(process.argv.slice(2))
        .scriptName('docs')
        .usage('$0 <cmd> [args]')
        .command('build', 'Build doc markdown from packages TSDocs',
            { output, packages, indexHeaderPath },
            async (argv) => {
                await buildDocs(argv.packages, argv.output)
            })
        .command('init', 'initialize docs config and github pages action',
            { packages },
            async (argv) => {
                await init(argv.packages)
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
        ).positional('siteUrl', {
            describe: 'site base URL (links will be directed there)',
            string: true,
            nargs: 0,
            require: true
        })
        .demandCommand()
        .help()
        .parseAsync().catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            process.exit(1);
        })
}