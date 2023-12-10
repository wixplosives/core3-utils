export type Listener<T> = (data: T) => void;

/**
 * Signal is a simple event emitter for one type of event.

 * @example
 * ```ts
 * const foodArrived = new Signal<Food>();
 *
 * foodArrived.subscribe(() => {
 *   console.log('Food arrived!');
 * });
 *
 * foodArrived.notify(new Food('pizza'));
 * ```
 *
 * @example Usage in a class:
 * ```ts
 * class LoginService {
 *     public onLoginSuccess = new Signal<User>();
 *     public onLoginFailure = new Signal<Error>();
 *     public onLoginStatusChange = new Signal<Status>();
 * }
 * ```
 * @remarks
 * Use Signals a public api for emitting events.
 * Naming a signal is like naming the event the it triggers.
 * If the name sounds like a property try to add a `on` prefix or `Change/Signal` suffix.
 * All methods are bound to the Signal instance
 * 
 * Notice that the Signals are public.
 * We don't need to implement specific subscriptions on the class, unless we need to expose it as a remote service.
 */
export class Signal<T> extends Set<Listener<T>> {
    /**
     * Subscribe a notification callback
     * @param handler - Will be executed with a data arg when a notification occurs
     */
    subscribe = (handler: Listener<T>) => {
        this.add(handler);
        return () => this.unsubscribe(handler);
    };
    /**
     * Unsubscribe an existing callback
     */
    unsubscribe = (handler: Listener<T>) => {
        this.delete(handler);
    };
    /**
     * Notify all subscribers with arg data
     */
    notify = (data: T) => {
        for (const handler of this) {
            handler(data);
        }
    };
}

/**
 * Basic type safe event emitter

 * @example
 * ```ts
 * const ms = new EventEmitter<{ onChange: { id: 'onChange' }; onDelete: { id: 'onDelete' } }>();
 * ms.subscribe('onChange', (event) => {
 *    event.id; // 'onChange'
 * });
 * ms.subscribe('onDelete', (event) => {
 *   event.id; // 'onDelete'
 * });
 *
 * ms.notify('onChange', { id: 'onChange' }); // event is type safe
 * ```
 * @example <caption>payload type mismatch</caption>
 * ```ts
 * ms.notify('onChange', { id: 'onDelete' }); // ERROR!!!
 * ```
 * @example <caption>payload type mismatch</caption>
 * ```ts
 * ms.notify('onSomethingElse', { id: 'onDelete' }); // ERROR!!!
 * ```
 */
