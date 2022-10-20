import { getIn } from './objects';

/**
 * Throws if value is not a string
 * @param value
 * @param errorMessage
 */
export function assertIsString(value: any, errorMessage = 'Value is not string'): asserts value is string {
    if (typeof value !== 'string') {
        throw Error(errorMessage);
    }
}

//
/**
 * Replaced non alphanumeric character with CSS unicode representation
 * @see https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
 * @param str
 * @returns CSS safe string
 */
export const escapeCSS = (str: string) =>
    str.replace(/\W/giu, (char) => {
        const code = char.codePointAt(0) ?? 0xfffd;
        return `\\${code.toString(16)} `;
    });

export enum NamingConvention {
    KebabCase = 'kebab-case',
    PascalCase = 'pascal-case',
    CamelCase = 'camel-case',
}

/**
 *
 * @param namingConvention
 * @returns true if namingConvention is a supported NamingConvention
 */
export function isValidNamingConvention(namingConvention: string): namingConvention is NamingConvention {
    return Object.values(NamingConvention).some((value) => value === namingConvention);
}

/**
 * Capitalize the first letter of a string
 * @param val
 * @returns val with the first letter capitalized
 */
export function capitalizeFirstLetter(val: string): string {
    return val.length === 0 ? val : val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Breaks down a string to words, dropping non letters and numbers
 * @example <caption>Spaces</caption> splitIntoWords("Hello world") => ["Hello", "world"]
 * @example <caption>Numbers</caption>  splitIntoWords("Hello123world") => ["Hello", "123" "world"]
 * @example <caption>Acronyms</caption> splitIntoWords("Hello WRL") => ["Hello", "WRL"]
 * @example <caption>Capitalized</caption> splitIntoWords("HelloWorld") => ["Hello", "World"]
 * @example <caption>Others characters</caption> splitIntoWords("Hello_world--"") => ["Hello", "world"]
 * @param str
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
 * @param str
 * @returns str in kebab-case-convention
 */
export function toKebabCase(str: string): string {
    return splitIntoWords(str).join('-').toLowerCase();
}

/**
 * Converts a string to PascalCase
 * @param str
 * @returns str in PascalCaseConvention
 */
export function toPascalCase(str: string): string {
    const words = splitIntoWords(str).map((word) => capitalizeFirstLetter(word.toLowerCase()));
    return words.join('');
}

/**
 * Similar to toPascalCase, but drops heading non-letters
 * @example toPascalCaseJsIdentifier("123helloWorld") => "HelloWorld"
 * @see toPascalCase
 * @param str
 * @returns str in PascalCaseConvention that starts with a letter
 */
export function toPascalCaseJsIdentifier(str: string): string {
    str = str.replace(/^[^a-z]+/i, ''); // must start with a letter
    return toPascalCase(str);
}

/**
 * Converts a string to camelCase
 * @param str
 * @returns str in camelCaseConvention
 */
export function toCamelCase(str: string): string {
    const words = splitIntoWords(str).map((word, index) =>
        index > 0 ? capitalizeFirstLetter(word.toLowerCase()) : word.toLowerCase()
    );
    return words.join('');
}

/**
 * Converts string formatting to a naming convention
 * @param str
 * @param namingConvention
 * @returns
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
 * like toKebabCase, but prepends '-' if first character of input is UpperCase
 */
export function toCSSKebabCase(str: string): string {
    const c = str.charAt(0);
    if (str.length && c === c.toUpperCase() && c !== c.toLowerCase()) {
        return `-${toKebabCase(str)}`;
    }
    return toKebabCase(str);
}

/**
 * like toCamelCase, but capitalizes first character if input starts with '-'
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
 * @param content
 * @param pos
 * @param newline zero based line number and character
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
 *
 * @param str
 * @param substr
 * @returns true is str contains substr, ignoring capitalization
 */
export function includesCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
}

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
 * @param modified
 * @param separator
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

export const isString = (value: unknown): value is string => typeof value === 'string';

const templateReg = /\$\{(.+?)\}/g;
/**
 * @param context A context for the compiler
 * @returns A template compiler function which accepts a template and compile it with `context`
 * @example
 * templateCompilerProvider({ greetings: 'Hello', person: { name: 'Elad' } })('${greetings} ${person.name}!')
 * // => Hello Elad!
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
