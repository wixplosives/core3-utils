import { isIterable, map } from '@wixc3/common';
import type ts from 'typescript';

export const getText = (found: Iterable<ts.Node> | ts.Node | undefined) =>
    isIterable(found) ? [...map(found, (n) => n.getText())] : found && found.getText();
