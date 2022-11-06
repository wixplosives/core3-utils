import { getIn } from './objects';

/**
 * Throws if value is not a string

 */
export function assertIsString(value: any, errorMessage = 'Value is not string'): asserts value is string {
    if (typeof value !== 'string') {
        throw Error(errorMessage);
    }
}

/**
 * Replaced non alphanumeric character with {@link https://drafts.csswg.org/cssom/#escape-a-character-as-code-point|CSS unicode representation}

 * @returns CSS safe string
 */
export const escapeCSS = (str: string) =>
    str.replace(/\W/giu, (char) => {
        const code = char.codePointAt(0) ?? 0xfffd;
        return `\\${code.toString(16)} `;
    });

/**

 */
export enum NamingConvention {
    KebabCase = 'kebab-case',
    PascalCase = 'pascal-case',
    CamelCase = 'camel-case',
}

/**
 * Checks if namingConvention is supported

 * @returns true if namingConvention is a supported {@link NamingConvention}
 */
export function isValidNamingConvention(namingConvention: string): namingConvention is NamingConvention {
    return Object.values(NamingConvention).some((value) => value === namingConvention);
}

/**
 * Capitalize the first letter of a string

 */
export function capitalizeFirstLetter(val: string): string {
    return val.length === 0 ? val : val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Breaks down a string to words, dropping non letters and numbers

 * @example
 * ```ts
 * splitIntoWords("Hello world") // => ["Hello", "world"]
 * splitIntoWords("Hello123world") // => ["Hello", "123" "world"]
 * splitIntoWords("Hello WRL") // => ["Hello", "WRL"]
 * splitIntoWords("HelloWorld") // => ["Hello", "World"]
 * splitIntoWords("Hello_world--") // => ["Hello", "world"]
 * ```
 * @returns An array of words contained in str
 */
export const splitIntoWords = (str: string): string[] => {
    let words = str.match(/[a-z0-9]+/gi) ?? [];
    words = words.flatMap((w) => w.split(/(\d+)/g)); // Numbers
    words = words.flatMap((w) => w.split(/([A-Z]+)(?=[A-Z][a-z])/g)); // Acronyms
    words = words.flatMap((w) => w.split(/([A-Z]?[a-z]+)/g)); // PascalCase and camelCase
    return words.filter((w) => w);
};

/**
 * Converts a string to kebab-case

 */
export function toKebabCase(str: string): string {
    return splitIntoWords(str).join('-').toLowerCase();
}

/**
 * Converts a string to PascalCase

 */
export function toPascalCase(str: string): string {
    const words = splitIntoWords(str).map((word) => capitalizeFirstLetter(word.toLowerCase()));
    return words.join('');
}

/**
 * Similar to {@link toPascalCase}, but drops heading non-letters

 * @example 
 * ```ts
 * toPascalCaseJsIdentifier("123helloWorld") // => "HelloWorld"
 * ```
 */
export function toPascalCaseJsIdentifier(str: string): string {
    str = str.replace(/^[^a-z]+/i, ''); // must start with a letter
    return toPascalCase(str);
}

/**
 * Converts a string to camelCase

 */
export function toCamelCase(str: string): string {
    const words = splitIntoWords(str).map((word, index) =>
        index > 0 ? capitalizeFirstLetter(word.toLowerCase()) : word.toLowerCase()
    );
    return words.join('');
}

/**
 * Converts string formatting to a naming convention

 */
export function toNamingConvention(str: string, namingConvention: NamingConvention): string {
    switch (namingConvention) {
        case NamingConvention.KebabCase:
            return toKebabCase(str);
        case NamingConvention.PascalCase:
            return toPascalCase(str);
        case NamingConvention.CamelCase:
            return toCamelCase(str);
    }
}

/**
 * like {@link toKebabCase}, but prepends '-' if first character of input is UpperCase

 */
export function toCSSKebabCase(str: string): string {
    const c = str.charAt(0);
    if (str.length && c === c.toUpperCase() && c !== c.toLowerCase()) {
        return `-${toKebabCase(str)}`;
    }
    return toKebabCase(str);
}

/**
 * like {@link toCamelCase}, but capitalizes first character if input starts with '-'

 */
export function toCSSCamelCase(str: string): string {
    const c = str.charAt(0);
    if (c === '-') {
        return capitalizeFirstLetter(toCamelCase(str));
    }
    return toCamelCase(str);
}

/**
 * Finds line an column by position index

 * @returns zero based line number and character
 */
export function indexToLineAndColumn(
    content: string,
    pos: number,
    newline = '\n'
): { character: number; line: number } {
    if (pos > content.length) {
        return {
            character: -1,
            line: -1,
        };
    }

    const newlineLength = newline.length;
    let line = 0;
    let character = 0;

    for (let i = 0; i < pos; i++) {
        if (content.slice(i, i + newlineLength) === newline) {
            line++;
            character = 0;
        } else {
            character++;
        }
    }

    return {
        line,
        character,
    };
}

/**
 * Checks if str contains substr ignoring capitalization

 */
export function includesCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
}

/**
 * Matches the indentation of modified to the one of reference

 * @param reference -
 * @param modified -
 * @param newline -
 * @returns 
 */
export function equalIdents(reference: string, modified: string, newline = '\n') {
    const referenceArr = reference.split(newline);
    const modifiedArr = modified.split(newline);
    return modifiedArr
        .map((line, idx) => {
            const referenceArrContent = referenceArr[idx];
            if (!referenceArrContent) {
                return line;
            }
            const trimmedRef = referenceArrContent.trimStart();

            const refIdent = referenceArrContent.slice(0, referenceArrContent.length - trimmedRef.length);
            return refIdent + line.trimStart();
        })
        .join(newline);
}

/**
 * Remove line indentation (heading whitespace)

 * @param modified-
 * @param separator-
 * @returns
 */
export function noIdents(modified: string, separator = '\n') {
    const modifiedArr = modified.split(separator);
    return modifiedArr
        .map((line) => {
            return line.trimStart();
        })
        .join(separator);
}

/**
 * Shifts all indentation to the left
 * using the line with the least indentation as a baseline
 */
export function minimalIndent(str: string) {
    const lines = str.split('\n');
    const min = lines.reduce((min, l) => Math.min(l.replace(/(\s*)(.*)/g, '$1').length, min), 0);
    return lines.map((l) => l.slice(min)).join('\n');
}

/**
 * Remove white spaces including empty lines
 */
export function noWhiteSpace(str: string) {
    return str
        .split('\n')
        .map((line) => line.replaceAll(/\s+/g, ' ').trim())
        .filter((i) => i)
        .join('\n');
}

/**
 * Checks is value is a string

 * @param value -
 * @returns 
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

const templateReg = /\$\{(.+?)\}/g;
/**
 * Similar to templated string, 
 * given a fixed context object returns a function that parses strings in it

 * @param context- A context for the compiler
 * @returns A template compiler function which accepts a template and compile it with `context`
 * @example
 * ```ts
 * const compile = templateCompilerProvider({ greetings: 'Hello', person: { name: 'Elad' } })
 * compile('${greetings} ${person.name}!')// => Hello Elad!
 * compile('${person.name} is awesome')// => Elad is awesome
 * ```
 */
export function templateCompilerProvider(context: Record<string, any>) {
    return function templateCompiler(template: string) {
        return template.replace(templateReg, (match, templateExpression: string) => {
            const pathInContext = templateExpression.trim().split('.');
            const valueInContext = getIn(context, pathInContext) as string;
            return valueInContext !== undefined ? valueInContext : match;
        });
    };
}

/**
 * Generates a string repeating [str] [count] times
 */
export function repeat(str: string, count: number) {
    return [...new Array<void>(count)].map(() => str).join('');
}

/**
 * Returns a string safe to be used in RegExp
 * @see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
 */
export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // $& means the whole matched string
}

/**
 * Removes comments from string
 * Note that there's lexical no parsing, so stuff like "//'//" will not work
 */
export function naiveStripComments(str: string) {
    return str.replaceAll(/\/\*.+?\*\//gs, '').replaceAll(/\s*(?<!:)\/\/.*\n?/g, '');
}
