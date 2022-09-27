import { expect } from "chai"
// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { same } from "../same"
import { toMap } from "../types"

describe('same', () => {
    describe('types unaffected by "unordered" param', ()=>{
        it('compares native values', () => {
            expect(same(1, 1)).to.eql(true)
            expect(same(1, 0)).to.eql(false)
            expect(same(null, undefined)).to.eql(false)
            expect(same(null, null)).to.eql(true)
            expect(same('a', 'a')).to.eql(true)
            expect(same('a', 'b')).to.eql(false)
        })
        it('compares POJOs', () => {
            expect(same({}, {})).to.eql(true)
            expect(same({ a: 1 }, { a: 1 })).to.eql(true)
            expect(same({ a: 1 }, { a: 2 })).to.eql(false)
            expect(same({ a: undefined }, {})).to.eql(false)
            expect(same({ a: undefined }, { a: null })).to.eql(false)
            expect(same({ a: 1, b: 2 }, { b: 2, a: 1 })).to.eql(true)
            expect(same({ a: { b: 1 } }, { a: { b: 1 } })).to.eql(true)
            expect(same({ a: { b: 1 } }, { a: { b: 2 } })).to.eql(false)
        })
        it('compares Maps', () => {
            expect(same(new Map(), new Map())).to.eql(true)
            expect(same(toMap({}), toMap({}))).to.eql(true)
            expect(same(toMap({ a: 1 }), toMap({ a: 1 }))).to.eql(true)
            expect(same(toMap({ a: 1 }), toMap({ a: 2 }))).to.eql(false)
            expect(same(toMap({ a: undefined }), toMap({}))).to.eql(false)
            expect(same(toMap({ a: undefined }), toMap({ a: null }))).to.eql(false)
            expect(same(toMap({ a: 1, b: 2 }), toMap({ b: 2, a: 1 }))).to.eql(true)
            expect(same(toMap({ a: { b: 1 } }), toMap({ a: { b: 1 } }))).to.eql(true)
            expect(same(toMap({ a: { b: 1 } }), toMap({ a: { b: 2 } }))).to.eql(false)
        })
        it('compares Sets', () => {
            expect(same(new Set(), new Set())).to.eql(true)
            expect(same(new Set([1]), new Set([1]))).to.eql(true)
            expect(same(new Set([1, 2, 3]), new Set([1, 2, 3]))).to.eql(true)
            expect(same(new Set([1]), new Set([2]))).to.eql(false)
        })
    })
    describe('ordered', () => {
        it('compares flat arrays', () => {
            expect(same([],[])).to.eql(true)
            expect(same([1,2],[1,2])).to.eql(true)
            expect(same([1,2],[2,1])).to.eql(false)
        })
        it('compares iterables', () => {
            expect(same([1,2][Symbol.iterator](),[1,2][Symbol.iterator]())).to.eql(true)
            expect(same([1,2][Symbol.iterator](),[2,1][Symbol.iterator]())).to.eql(false)
        })
        it('compares nested arrays', () => {
            expect(same([[[]]],[[[]]])).to.eql(true)
            expect(same([1,[2,3]],[1,[2,3]])).to.eql(true)
            expect(same([1,[3,2]],[1,[3,2]])).to.eql(true)
        })
        it('ignores the order within objects, maps and sets', ()=>{
            expect(same([{b:0, a:1}],[{a:1, b:0}])).to.eql(true)
            expect(same([toMap({b:0, a:1})],[toMap({a:1, b:0})])).to.eql(true)
            expect(same([new Set([1,2])],[new Set([2,1])])).to.eql(true)
        })
        it('checks the order of arrays within objects', ()=>{
            expect(same([{a:[0,1]}],[{a:[1,0]}])).to.eql(false)
        })
    })
    describe('unordered array', ()=>{
        it('ignores order of flat arrays', ()=>{
            expect(same([0,1,2],[2,1,0], true)).to.eql(true)
            expect(same([0,1,2],[2,1,0], true)).to.eql(true)
        })
        it('ignores order of nested arrays', ()=>{
            expect(same([0,[1,2]],[[2,1],0], true)).to.eql(true)
        })
    })
})