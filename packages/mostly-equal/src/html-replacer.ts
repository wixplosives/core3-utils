import { Replacer } from './types';

export const HTMLReplacer: Replacer = {
    isApplicable(value) {
        return value instanceof Element;
    },
    replace(value) {
        const el = value as Element;
        const attrs: string[] = [];
        for (let i = 0; i < el.attributes.length; i++) {
            const attr = el.attributes.item(i);

            attrs.push(`${attr?.name}="${attr?.value}"`);
        }
        const attrString = attrs.length ? ` ${attrs.join(' ')} ` : '';
        const isClosed = el.children.length === 0;
        return `<${el.tagName.toLowerCase()}${attrString}${
            isClosed ? '/>' : `>${el.children.length} children</${el.tagName.toLowerCase()}>`
        }`;
    },
};
