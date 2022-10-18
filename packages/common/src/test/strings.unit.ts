import { backSlash, splitIntoWords, toCamelCase, toKebabCase, toPascalCase } from '..';
import { expect } from 'chai';

describe('String Utils', () => {
    it('splitIntoWords', () => {
        expect(splitIntoWords('camelCaseWords')).to.eql(['camel', 'Case', 'Words']);
        expect(splitIntoWords('PascalCaseWords')).to.eql(['Pascal', 'Case', 'Words']);
        expect(splitIntoWords('snake_case_words')).to.eql(['snake', 'case', 'words']);
        expect(splitIntoWords('kebab-case-words')).to.eql(['kebab', 'case', 'words']);
        expect(splitIntoWords('UPPER_CASE_WORDS')).to.eql(['UPPER', 'CASE', 'WORDS']);
        expect(splitIntoWords('HTMLAcronymHTML')).to.eql(['HTML', 'Acronym', 'HTML']);
        expect(splitIntoWords('innerHTML')).to.eql(['inner', 'HTML']);
        expect(splitIntoWords('123numbers321')).to.eql(['123', 'numbers', '321']);
        expect(splitIntoWords('__~=@special@=~__')).to.eql(['special']);
        expect(splitIntoWords('a')).to.eql(['a']);
        expect(splitIntoWords('-')).to.eql([]);
        expect(splitIntoWords('')).to.eql([]);
    });

    it('toKebabCase', () => {
        expect(toKebabCase('camelCaseWords')).to.equal('camel-case-words');
        expect(toKebabCase('HTMLAcronymHTML')).to.equal('html-acronym-html');
    });

    it('toPascalCase', () => {
        expect(toPascalCase('camelCaseWords')).to.equal('CamelCaseWords');
        expect(toPascalCase('HTMLAcronymHTML')).to.equal('HtmlAcronymHtml');
        expect(toPascalCase('HOW_BOUT_DAT')).to.equal('HowBoutDat');
    });

    it('toCamelCase', () => {
        expect(toCamelCase('camelCaseWords')).to.equal('camelCaseWords');
        expect(toCamelCase('HTMLAcronymHTML')).to.equal('htmlAcronymHtml');
        expect(toCamelCase('HOW_BOUT_DAT')).to.equal('howBoutDat');
    });

    describe('backSlash', () => {
        it('removes multiple heading slashes', () => {
            expect(backSlash('////file.name', 'none')).to.equal('file.name')
            expect(backSlash('////file.name', 'heading')).to.equal('/file.name')
            expect(backSlash('////file.name', 'trailing')).to.equal('file.name/')
            expect(backSlash('////file.name', 'both')).to.equal('/file.name/')
        })
        it('removes multiple trailing slashes', () => {
            expect(backSlash('file.name////', 'none')).to.equal('file.name')
            expect(backSlash('file.name////', 'heading')).to.equal('/file.name')
            expect(backSlash('file.name////', 'trailing')).to.equal('file.name/')
            expect(backSlash('file.name////', 'both')).to.equal('/file.name/')
        })
        it('keeps slashes in the middle', () => {
            expect(backSlash('file/name', 'none')).to.equal('file/name')
            expect(backSlash('file/name', 'heading')).to.equal('/file/name')
            expect(backSlash('file/name', 'trailing')).to.equal('file/name/')
            expect(backSlash('file/name', 'both')).to.equal('/file/name/')
        })
        it('handles no slashes', () => {
            expect(backSlash('file.name', 'none')).to.equal('file.name')
            expect(backSlash('file.name', 'heading')).to.equal('/file.name')
            expect(backSlash('file.name', 'trailing')).to.equal('file.name/')
            expect(backSlash('file.name', 'both')).to.equal('/file.name/')
        })
    })
});
