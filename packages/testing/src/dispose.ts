import {
    createDisposables,
    DEFAULT_GROUP,
    DisposableOptions,
    type Disposable,
    type GroupConstraints,
} from '@wixc3/patterns';
import { _afterEach } from './mocha-helpers';

const disposables = createDisposables();
export const DEFAULT_DISPOSAL_GROUP = DEFAULT_GROUP;

/**
 * Disposes of test resources after the test is done
 * @example
 * ```ts
 * it('test', () => {
 *      const listener = () =>{}
 *      someService.on('event', listener)
 *      disposeAfter(() => someService.off('event', listener))
 * })
 * ```
 *
 * @param group disposal group name. disposal groups let you specify disposal constrains. see: {@link createDisposalGroup}
 */
export function disposeAfter(disposable: Disposable, options?: DisposableOptions) {
    disposables.add(disposable, options);
}

/**
 * Creates a new disposal group
 * @example
 * ```ts
 * it('test', () => {
 *      createDisposalGroup('group1', { before: DisposalGroups.DEFAULT_GROUP })
 *      disposeAfter(() => {}) // will be disposed in default group
 *      disposeAfter(() => {}, 'group1') // will be disposed before the default group
 * })
 * ```
 *
 * @param name disposal group name, must be unique
 * @param constraints disposal group must have constrains, either before or after another group(s)
 */
export function createDisposalGroup(name: string, constraints: GroupConstraints[] | GroupConstraints) {
    disposables.registerGroup(name, constraints);
}

/**
 * Runs target.init and disposes of it after the test is done
 *  * @example
 * ```ts
 * it('test', async () => {
 *      const myService = {
 *         init: (a:string) => {console.log(a)},
 *         dispose: () => {console.log('disposed')}
 *      }
 *      await initAndDisposeAfter(myService, 'hello') // logs 'hello'
 * })
 * // logs 'disposed' after the test is done
 * ```
 * @returns init result
 */
export async function initAndDisposeAfter<T extends (...args: any[]) => any>(
    target: { init: T } & Disposable,
    ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>> {
    disposeAfter(target);
    const res = target.init(...args) as ReturnType<T>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Promise.resolve(res);
}

_afterEach('disposing', async function () {
    const list = disposables.list();
    this.timeout(list.totalTimeout);
    try {
        await disposables.dispose();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(list);
        throw e;
    }
});
