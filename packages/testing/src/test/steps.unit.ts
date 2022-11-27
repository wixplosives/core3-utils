import { sleep } from "promise-assist";
import { runSteps, step } from "../steps";
import Sinon from 'sinon'
import { expect, use } from 'chai'
import asPromised from 'chai-as-promised'

use(asPromised)

describe('runSteps', ()=>{
    let clock:Sinon.SinonFakeTimers;
    beforeEach(()=>{
        clock = Sinon.useFakeTimers()
    })
    afterEach(()=>{
        clock.restore()
    })

    it('waits for the steps to finish', async function() {
        const result:number[] = [];
        const test = runSteps(function*(){
            yield step(sleep(100).then(()=>{result.push(0)}))
            yield step(sleep(100).then(()=>{result.push(1)}))
            yield step(sleep(100).then(()=>{result.push(2)}))
        })
        const t:Promise<void> = test.bind(this)() 
        expect(result).to.eql([])
        await clock.tickAsync(100)
        expect(result).to.eql([0])
        await clock.tickAsync(100)
        expect(result).to.eql([0,1])
        await clock.tickAsync(100)
        expect(result).to.eql([0,1,2])
        return t
    })
    it('fails with the step description when a step times out', async function () {
        const test = runSteps(function*(){
            yield step(sleep(100), 10, 'wait too long')
        })
        const t:Promise<void> = test.bind(this)() 
        // by returning this expectation the promise rejection is not dangling
        const exp =  expect(t).to.eventually.be.rejectedWith('Failed in step "wait too long" after 10ms')
        await clock.tickAsync(11)
        return exp
    })
    it('yields the result of a step', async function () {
        const test = runSteps(function*(){
            const res = (yield step(Promise.resolve('success'))) as string
            expect(res).to.equal('success')
        })
        const t:Promise<void> = test.bind(this)() 
        await clock.tickAsync(1)
        return t
    })

    describe('example',()=>{
        const fetchServerData = ()=>Promise.resolve('server data')
        // {@label runSteps
        it('runs the steps', runSteps(function*(){
            expect(yield step(Promise.resolve(1), 10, "prep")).to.equal(1)
            expect(yield step(fetchServerData(), 100, "get data from server")).to.equal("server data")
        }))
        // @}
    })
})