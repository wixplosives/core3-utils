import { timeDilation } from "./time-dilation";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
if ((globalThis as {process?:{env:{DEBUG?:string}}})?.process?.env?.DEBUG === 'true') {
    timeDilation(Number.POSITIVE_INFINITY);
    (globalThis as {mocha?:Mocha})?.mocha?.timeout(Number.POSITIVE_INFINITY)
}