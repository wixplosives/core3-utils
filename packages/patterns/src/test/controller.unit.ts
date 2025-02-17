import { expect } from 'chai';
import { Controller } from '../controller/controller';

class TestController extends Controller {
    testCounter = 0;
    disposeCounter = 0;
    public stateValue1 = 0;
    public stateValue2 = 0;
    updateProps(a: number, b: number) {
        this.stateValue1 = this.memoTest(a, b);
        this.stateValue2 = this.memoTestWithDispose(a, b);
    }
    override disposeSync(): void {
        super.disposeSync();
        this.disposeCounter++;
    }
    memoTest = this.memo((a: number, b: number) => {
        this.testCounter++;
        return { value: a + b };
    });
    memoTestWithDispose = this.memo((a: number, b: number) => {
        this.testCounter++;
        return { value: a + b, dispose: () => this.disposeCounter++ };
    });
    memoCustomIsEqual = this.memo(
        (a: number, b: number) => {
            this.testCounter++;
            return { value: a + b };
        },
        (deps, prevDeps) => {
            return deps[0] === prevDeps[0];
        }
    );
}

describe.only('Controller', () => {
    it('should memo member function', () => {
        const controller = new TestController();
        controller.memoTest(1, 2);
        expect(controller.testCounter).to.equal(1);
        controller.memoTest(1, 2);
        expect(controller.testCounter).to.equal(1);
        controller.memoTest(1, 3);
        expect(controller.testCounter).to.equal(2);
    });
    it('should return result', () => {
        const controller = new TestController();
        expect(controller.memoTest(1, 2)).to.deep.equal(3);
    });
    it('should dispose before each new calculation', () => {
        const controller = new TestController();
        controller.memoTestWithDispose(1, 2); // no dispose
        controller.memoTestWithDispose(1, 3); // dispose
        controller.memoTestWithDispose(1, 4); // dispose
        expect(controller.disposeCounter).to.equal(2);
        controller.disposeSync(); // dispose
        expect(controller.disposeCounter).to.equal(3);
    });
    it('should use custom isEqual', () => {
        const controller = new TestController();
        controller.memoCustomIsEqual(1, 2);
        expect(controller.testCounter).to.equal(1);
        controller.memoCustomIsEqual(1, 3); // first arg is equal to prevues call no recalculation
        expect(controller.testCounter).to.equal(1);
        controller.memoCustomIsEqual(2, 2); // first arg is not equal to prevues call recalculation
        expect(controller.testCounter).to.equal(2);
    });
});
