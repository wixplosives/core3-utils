import { useEffect, useMemo } from 'react';
import type { Signal } from '@wixc3/patterns';

export class UIController {
    updateProps?(...args: any): void;
    dispose() {}
}

type UIControllerClass = { new (): UIController };

type GetUpdatePropsType<T extends UIControllerClass> = InstanceType<T>['updateProps'];

type UseControllerArgs<T extends UIControllerClass> = GetUpdatePropsType<T> extends (...args: any) => void
    ? [Class: T, ...args: Parameters<GetUpdatePropsType<T>>]
    : [Class: T];


/**
 * This hook returns a function that when called will force the component to rerender.
 */
const toggle = (prev: boolean) => !prev;
const useForceUpdate = () => {
    const [, setState] = useState(false);
    return useCallback(() => setState(toggle, []);
};
/**
 * This hook allows to separate the controller logic from the view logic.
 * It creates a new memoized instance. and calls the updateProps method on each render.
 * The instance is disposed when the component unmounts.
 *
 * This hook does not rerender the component when the controller updates.
 * The responsibility of the controller is to manage the updateProps and invalidate the controller when needed.
 * Usually the controller will have a Signal (onChange) that the component can be subscribed to with the useSignal/useMultiSignalAsyncUpdate hooks.
 * @example
 * ```tsx
 * const controller = useLocalController(MyController, { foo: 'bar' });
 * ```
 */
export function useLocalController<T extends UIControllerClass>(...args: UseControllerArgs<T>) {
    const [Class, ...instanceArgs] = args;
    const instance = useMemo(() => new Class(), [Class]) as InstanceType<T>;
    useEffect(() => () => instance.dispose?.(), [instance]);
    instance.updateProps?.(...instanceArgs);
    return instance;
}
/**
 * This hook subscribes to a signal and updates the component when the signal is triggered.
 * When asyncUpdate is true the component will be updated on the next animation frame.
 * @example
 * ```tsx
 * const controller = useLocalController(MyController, { foo: 'bar' });
 * useSignal(controller.onChange);
 * useSignal(controller.onMouseMove, true);
 * ```
 */
export function useSignal(signal: Signal<any>, asyncUpdate = false) {
    const forceUpdate = useForceUpdate();
    useEffect(() => {
        const update = asyncUpdate ? animationFrameLimiter(forceUpdate) : forceUpdate;
        signal.subscribe(update);
        return () => signal.unsubscribe(update);
        // forceUpdate is a stable function so we don't need to add it to the deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signal]);
}

/**
 * This hook subscribes to multiple signals and updates the component when any of the signals are triggered on the next animation frame.
 * @example
 * ```tsx
 * const controller = useLocalController(MyController, { foo: 'bar' });
 * useMultiSignalAsyncUpdate([controller.onChange, controller.onMouseMove]);
 * ```
 */
export function useMultiSignalAsyncUpdate(signals: Signal<any>[]) {
    const forceUpdate = useForceUpdate();
    useEffect(() => {
        const rateLimitedForceUpdate = animationFrameLimiter(forceUpdate);
        signals.forEach((signal) => signal.subscribe(rateLimitedForceUpdate));
        return () => signals.forEach((signal) => signal.unsubscribe(rateLimitedForceUpdate));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, signals /* we want the signal itself to be the dependency of this effect the signals array does not matter, also the forceUpdate is stable*/);
}

/**
 * This function limits the calls to the given function to the next animation frame.
 */
function animationFrameLimiter(action: () => void) {
    let isScheduled = false;
    function preformAction() {
        if (isScheduled) {
            isScheduled = false;
            action();
        }
    }
    return function actionLimited() {
        if (isScheduled) {
            return;
        }
        isScheduled = true;
        requestAnimationFrame(preformAction);
    };
}

