export interface Token {
    type: TokenType;
    start: number;
    end: number;
    value: string;
}

export type UnionFromArray<T> = T extends ReadonlyArray<unknown> ? T[number] : never;
export type Descriptors =
    | 'string'
    | 'text'
    | 'line-comment'
    | 'multi-comment'
    | 'unclosed-string'
    | 'unclosed-comment'
    | 'space';

export type Delimiters = '(' | ')' | ',' | ';' | ':';

export type TokenType = Descriptors | Delimiters;

// this is written inline here because this code is performance oriented, and using [].includes or Set.has is slower
const isDelimiter = (char: string): char is Delimiters =>
    char === '(' || char === ')' || char === ',' || char === ';' || char === ':';
const isStringDelimiter = (char: string) => char === `'` || char === `"` || char === '`';
const isWhitespace = (char: string) => char === ' ' || char === `\t` || char === `\r` || char === '\n';

export function tokenize(source: string) {
    const tokens: Token[] = [];
    let previousChar = '';
    let buffer = '';
    let inComment = '';
    let inString = '';
    let start = 0;
    let nextCharIndex = 0;
    for (const ch of source) {
        nextCharIndex += ch.length;
        if (inString) {
            buffer += ch;
            if (ch === inString && previousChar !== '\\') {
                inString = '';
                pushBuffer('string');
            }
        } else if (inComment) {
            buffer += ch;
            if (inComment === 'line-comment' && ch === '\n') {
                inComment = '';
                pushBuffer('line-comment');
            } else if (inComment === 'multi-comment' && ch === '/' && previousChar === '*') {
                inComment = '';
                pushBuffer('multi-comment');
            }
        } else if (ch === '/' && source[nextCharIndex] === '/') {
            pushBuffer();
            buffer += ch;
            inComment = 'line-comment';
        } else if (ch === '/' && source[nextCharIndex] === '*') {
            pushBuffer();
            buffer += ch;
            inComment = 'multi-comment';
        } else if (isStringDelimiter(ch)) {
            pushBuffer();
            buffer += ch;
            inString = ch;
        } else if (isDelimiter(ch)) {
            pushBuffer();
            buffer += ch;
            pushBuffer(ch);
        } else if (isWhitespace(ch) && !isWhitespace(previousChar)) {
            pushBuffer();
            buffer += ch;
        } else if (!isWhitespace(ch) && isWhitespace(previousChar)) {
            pushBuffer();
            buffer += ch;
        } else {
            buffer += ch;
        }
        previousChar = ch;
    }
    if (buffer.length) {
        if (inComment) {
            if (inComment === 'line-comment') {
                pushBuffer('line-comment');
            } else {
                pushBuffer('unclosed-comment');
            }
        } else if (inString) {
            pushBuffer('unclosed-string');
        } else {
            pushBuffer();
        }
    }
    function pushBuffer(type?: TokenType) {
        if (buffer.length === 0) {
            return;
        }
        const end = start + buffer.length;
        tokens.push({
            value: buffer,
            type: type ?? (buffer.trim().length ? 'text' : 'space'),
            start,
            end,
        });
        start = end;
        buffer = '';
    }
    return tokens;
}
export function tokenizeCSSURLS(source: string) {
    return getUrlTokens(tokenize(source));
}
function getUrlTokens(tokens: Token[]) {
    const urls: Token[][] = [];
    let inUrl;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (inUrl && token) {
            inUrl.push(token);
            if (token.type === ')') {
                urls.push(inUrl);
                inUrl = undefined;
            }
        } else if (token && token.type === 'text' && token.value === 'url' && tokens[i + 1]?.type === '(') {
            inUrl = [token];
        }
    }
    return urls;
}
