import { Replacer } from './types';
import { map } from '@wixc3/common';

export interface PseudoElement {
    tagName: string;
    attributes: Iterable<{ name: string; value: string }>;
    children: { length: number };
}

export type PseudoElementConstructor = {
    new (): PseudoElement | Element;
};

export const HTMLReplacer = (Element: PseudoElementConstructor = globalThis.Element): Replacer => ({
    isApplicable(value) {
        return value instanceof Element;
    },
    replace(value) {
        const el = value as PseudoElement;
        const attrs = [...map(el.attributes, (attr) => `${attr?.name}="${attr?.value}"`)].join(' ');
        const attrString = attrs ? ' ' + attrs + ' ' : '';
        const isClosed = el.children.length === 0;
        return `<${el.tagName.toLowerCase()}${attrString}${
            isClosed ? '/>' : `>${el.children.length} children</${el.tagName.toLowerCase()}>`
        }`;
    },
});
