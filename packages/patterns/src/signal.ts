/**
 * Signal is a simple event emitter for one type of event.
 *
 * Use Signals a public api for emitting events.
 * Naming a signal is like naming the event the it triggers.
 * If the name sounds like a property try to add a `on` prefix or `Change/Signal` suffix.
 * All methods are bound to the Signal instance
 *
 * Simple example:
 * ```
 * const foodArrived = new Signal<Food>();
 *
 * foodArrived.subscribe(() => {
 *   console.log('Food arrived!');
 * });
 *
 * foodArrived.notify(new Food('pizza'));
 * ```
 *
 * Usage in a class:
 * ```
 * class LoginService {
 *     public onLoginSuccess = new Signal<User>();
 *     public onLoginFailure = new Signal<Error>();
 *     public onLoginStatusChange = new Signal<Status>();
 * }
 * ```
 *
 * Notice that the Signals are public.
 * We don't need to implement specific subscriptions on the class, unless we need to expose it as a remote service.
 *
 */

export type Listener<T> = (data: T) => void;

export class Signal<T> extends Set<Listener<T>> {
    subscribe = (i: Listener<T>) => {
        this.add(i);
    };
    unsubscribe = (i: Listener<T>) => {
        this.delete(i);
    };
    notify = (data: T) => {
        for (const listener of this) {
            listener(data);
        }
    };
}

/**
 * Same as signal but for multiple types differentiating by the key.
 *
 * Usage
 *
 * const ms = new MultiSignal<{ onChange: { id: 'onChange' }; onDelete: { id: 'onDelete' } }>();
 * ms.subscribe('onChange', (event) => {
 *    event.id; // 'onChange'
 * });
 * ms.subscribe('onDelete', (event) => {
 *   event.id; // 'onDelete'
 * });
 *
 * ms.notify('onChange', { id: 'onChange' }); // event is type safe
 * ms.notify('onChange', { id: 'onDelete' }); // ERROR!!!
 * ms.notify('onSomethingElse', { id: 'onDelete' }); // ERROR!!!
 *
 */
export class MultiSignal<T extends Record<string, unknown>, K extends keyof T = keyof T> {
    private signals = new Map<K, Signal<any>>();
    has = <Id extends K>(id: Id) => this.signals.has(id);
    subscribe = <Id extends K>(id: Id, h: (data: T[Id]) => void) => {
        const bucket = this.signals.get(id);
        bucket ? bucket.add(h) : this.signals.set(id, new Signal([h]));
    };
    unsubscribe = <Id extends K>(id: Id, h: (data: T[Id]) => void) => {
        const bucket = this.signals.get(id);
        bucket?.delete(h);
        bucket?.size === 0 && this.signals.delete(id);
    };
    delete = <Id extends K>(id: Id) => {
        this.signals.delete(id);
    };
    notify = <Id extends K>(id: Id, data: T[Id]) => {
        this.signals.get(id)?.notify(data);
    };
}
