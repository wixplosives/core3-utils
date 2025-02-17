type MemoResults =
    | void
    | { dispose: () => void; value: unknown }
    | { dispose?: undefined; value: unknown }
    | { value?: undefined; dispose: () => void };

type DisposableMemoFunction<Args extends unknown[]> = (...args: Args) => MemoResults;

type InferDisposableMemoReturnValue<T extends DisposableMemoFunction<any>> = ReturnType<T> extends { value: infer U }
    ? U
    : void;

type InferDisposableArgs<T extends DisposableMemoFunction<any>> = Parameters<T>;

export type RegistrationKey = string | DisposableMemoFunction<any>;
export type RegistrationValue = {
    result: MemoResults;
    disposableMemo: DisposableMemoFunction<unknown[]>;
    deps: unknown[];
};

export abstract class Controller {
    protected registrations = new Map<RegistrationKey, RegistrationValue>();
    private memoCall<T extends DisposableMemoFunction<any>>(
        id: string | T,
        disposableMemo: T,
        deps: InferDisposableArgs<T>,
        isEqual?: (deps: unknown[], prevDeps: unknown[]) => boolean
    ) {
        const prev = this.registrations.get(id);
        if (prev) {
            const equal = isEqual ? isEqual(deps, prev.deps) : this.isShallowEqual(deps, prev.deps);
            if (equal) {
                return prev.result?.value as InferDisposableMemoReturnValue<typeof disposableMemo>;
            } else {
                prev.result?.dispose?.();
            }
        }
        const result = disposableMemo.apply(this, deps);
        this.registrations.set(id, { result, deps, disposableMemo });
        return result?.value as InferDisposableMemoReturnValue<typeof disposableMemo>;
    }
    protected memo<T extends DisposableMemoFunction<any>>(
        fn: T,
        isEqual?: (deps: unknown[], prevDeps: unknown[]) => boolean
    ) {
        return (...args: InferDisposableArgs<T>) => {
            return this.memoCall(fn, fn, args, isEqual);
        };
    }
    protected isShallowEqual(deps: unknown[], prevDeps: unknown[]) {
        return deps.every((dep, i) => Object.is(dep, prevDeps[i]));
    }
    disposeSync() {
        for (const { result } of this.registrations.values()) {
            result?.dispose?.();
        }
        this.registrations.clear();
    }
}



