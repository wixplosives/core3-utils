import { chain, concat, find, isString, map, noWhiteSpace, Predicate } from '@wixc3/common';
import ts from 'typescript';

/**
 * Finds all nodes satisfying the predicate
 */
export function findAllNodes(source: ts.Node | ts.Node[], predicate: Predicate<ts.Node>): Iterable<ts.Node> {
    const findInNodes = (nodes: ReadonlyArray<ts.Node>) =>
        nodes.reduce(
            (found: Iterable<ts.Node>, n: ts.Node): Iterable<ts.Node> => concat(found, findAllNodes(n, predicate)),
            [] as Iterable<ts.Node>,
        );

    if (Array.isArray(source)) {
        return findInNodes(source);
    } else {
        if (!source.parent && !ts.isSourceFile(source)) {
            throw new Error(
                'AST Node has no parent. use compileCode or make sure the "setParentNodes" (3rd argument) is set to true in ts.createSourceFile',
            );
        }
    }
    if (ts.isSourceFile(source) || ts.isBlock(source)) {
        return findInNodes(source.statements);
    }

    return concat(predicate(source) ? [source] : [], findInNodes(source.getChildren()) as ts.Node[]);
}

/**
 * Finds the first node (via DFS) satisfying the predicate
 */
export function findNode(source: ts.Node | ts.Node[], predicate: Predicate<ts.Node>) {
    const findInNodes = (nodes: ReadonlyArray<ts.Node>) =>
        nodes.reduce(
            (found: ts.Node | undefined, n: ts.Node): ts.Node | undefined => found || findNode(n, predicate),
            undefined,
        );

    if (source instanceof Array) {
        return findInNodes(source);
    }
    if (ts.isSourceFile(source)) {
        return findInNodes(source.statements);
    } else {
        if (!source.parent) {
            throw new Error(
                'AST Node has no parent. use compileCode or make sure the "setParentNodes" (3rd argument) is set to true in ts.createSourceFile',
            );
        }
    }

    return predicate(source) ? source : findInNodes(source.getChildren());
}

/**
 * Finds all nodes following a comment
 */
export function findNodeAfterComment(node: ts.Node | undefined, comment: RegExp | string): Iterable<ts.Node> {
    const matchedComments = new Set<number>();
    return node
        ? findAllNodes(node, (n) => {
              const comments = getLeadingComments(n);
              const matchedComment = find(comments, ({ text, pos }) => {
                  let match = false;
                  if (!matchedComments.has(pos)) {
                      match = isString(comment)
                          ? noWhiteSpace(comment) === noWhiteSpace(text)
                          : text.match(comment) !== null;
                      if (match) {
                          matchedComments.add(pos);
                      }
                  }
                  return match;
              });
              return matchedComment !== undefined;
          })
        : [];
}

export type Comment = {
    text: string;
    pos: number;
    end: number;
};
/**
 * A more regorges ts.getLeadingCommentRanges:
 * Finds mid - statement comments as well
 * @returns text - the content of the comment, without // or /* *\/
 */
export function getLeadingComments(node: ts.Node): Iterable<Comment> {
    const file = node.getSourceFile().text;
    let comments: Iterable<Comment> | undefined = ts.getLeadingCommentRanges(file, node.pos)?.map(({ pos, end }) => ({
        text: file.slice(pos, end),
        pos,
        end,
    }));

    if (!comments) {
        const text = file.slice(node.pos, node.end);
        const lineCom = text.matchAll(/^\s*\/\/.*?\s*\n/g);
        const mlCom = text.matchAll(/^\s*\/\*.*?\s*\*\//g);
        comments = chain(lineCom)
            .concat(mlCom)
            .map((f) => {
                const text = f[0];
                const pos = file.indexOf(text, node.pos);
                const end = pos + text.length;
                return { text, pos, end };
            }).iterable;
    }
    return map(comments, (c) => {
        const text = c.text.replace(/^\s*\/\/(.*?)\s*\n?/g, '$1').replace(/^\s*\/\*(.*?)\s*\*\//g, '$1') || '';
        return { ...c, text };
    });
}
