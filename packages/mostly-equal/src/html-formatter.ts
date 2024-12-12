import { map } from '@wixc3/common';
import type { Formatter } from './types.js';

export interface PseudoElement {
    tagName: string;
    attributes: Iterable<{ name: string; value: string }>;
    children: { length: number };
}

export type PseudoElementConstructor = {
    new (): PseudoElement | Element;
};

export const HTMLFormatter = (Element: PseudoElementConstructor = globalThis.Element): Formatter => ({
    isApplicable(value) {
        return value instanceof Element;
    },
    format(value) {
        const el = value as PseudoElement;
        const attrs = [...map(el.attributes, (attr) => `${attr?.name}="${attr?.value}"`)].join(' ');
        const attrString = attrs ? ' ' + attrs + ' ' : '';
        const isClosed = el.children.length === 0;
        return `<${el.tagName.toLowerCase()}${attrString}${
            isClosed ? '/>' : `>${el.children.length} children</${el.tagName.toLowerCase()}>`
        }`;
    },
});
