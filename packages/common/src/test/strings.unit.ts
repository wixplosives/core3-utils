import { noWhiteSpace, splitIntoWords, toCamelCase, toKebabCase, toPascalCase } from '..';
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
});

it('noWhiteSpace', () => {
    expect(noWhiteSpace('no whitespace')).to.equal('no whitespace');
    expect(noWhiteSpace('\t\ttabs\t')).to.equal('tabs');
    expect(noWhiteSpace('   single    line  ')).to.equal('single line');
    expect(noWhiteSpace('   multiple \r\n  lines  ')).to.equal('multiple\nlines');
    expect(noWhiteSpace('   empty \n\n \n  lines  ')).to.equal('empty\nlines');
});
