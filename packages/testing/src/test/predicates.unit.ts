import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { expectIncludes, expectIncludesDeep, expectSize, withSteps } from '../steps';
use(asPromised);


describe('predicates', ()=>{
    withSteps.it('expectIncludesDeep', async ({ poll }) => {
        await poll(()=>({a:{b:{}}}), expectIncludesDeep({a:{b:{}}}))
        await expect( poll(()=>({a:{b:{}}}), expectIncludesDeep({c:{}}))).to.eventually.rejectedWith("expected { a: { b: {} } } to have deep property 'c'")
    })
    withSteps.it('expectIncludes', async ({ poll }) => {
        await poll(()=>[1,3], expectIncludes(1))
        await expect( poll(()=>({a:{b:{}}}), expectIncludesDeep({c:{}}))).to.eventually.rejectedWith("expected { a: { b: {} } } to have deep property 'c'")
    })
    withSteps.it('expectSize', async ({ poll }) => {
        await poll(()=>[], expectSize(0))
        await expect( poll(()=>[1],expectSize(0))).to.eventually.rejectedWith("expected 1 to equal +0")
    })
    
})