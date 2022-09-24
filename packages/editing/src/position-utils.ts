import type { Range } from "vscode-languageserver-types";
import { last } from '@wixc3/common'

export function charPosToLinePos(fileSplitText: string[], pos: number): { line: number; char: number } {
    let currentPos = 0;
    let currentLine = 0;
    for (const currentLineText of fileSplitText) {
        if (currentPos + 1 + currentLineText.length > pos) {
            return {
                line: currentLine,
                char: pos - currentPos,
            };
        }
        currentLine++;
        currentPos += currentLineText.length + 1;
    }
    return {
        line: fileSplitText.length - 1,
        char: fileSplitText[fileSplitText.length - 1]?.length || 0,
    };
}

export function charPosToLinePosWithLineStarts(
    lineStarts: number[],
    totalLength: number,
    pos: number
): { line: number; char: number } {
    if (pos <= 0 || lineStarts.length === 0) {
        return {
            line: 0,
            char: 0,
        };
    }

    for (let currentLine = 1; currentLine < lineStarts.length; currentLine++) {
        if (lineStarts[currentLine]! > pos) {
            return {
                line: currentLine - 1,
                char: pos - lineStarts[currentLine - 1]!,
            };
        }
    }

    const lastLineLength = totalLength - last(lineStarts)!;
    return {
        line: lineStarts.length - 1,
        char: lastLineLength,
    };
}


/**
 * recieves zero based line number and character returns 0 based index in file
 * @param content
 * @param pos
 * @param newline
 */
export function lineAndColumnToIndex(
    content: string,
    pos: {
        line: number;
        character: number;
    },
    newline = '\n'
): number {
    const newlineLength = newline.length;
    let line = 0;
    let character = 0;
    for (let i = 0; i < content.length + 1; i++) {
        if (line === pos.line && character === pos.character) {
            return i;
        }
        if (content.slice(i, i + newlineLength) === newline) {
            line++;
            character = 0;
        } else {
            character++;
        }
    }

    return -1;
}


export const lspRangeToTS = (content: string, fileName: string, range: Range): { start: number; length: number } => {
    if (!content) {
        return {
            start: 0,
            length: 0,
        };
    }

    const start = lineAndColumnToIndex(content, {
        line: range.start.line,
        character: range.start.character,
    });

    const end = lineAndColumnToIndex(content, {
        line: range.end.line,
        character: range.end.character,
    });
    return {
        start,
        length: end - start,
    };
};