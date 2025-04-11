import { SignalBase } from './signal-base';

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
export class Signal<T> extends SignalBase<T> {
    /**
     * Notify all subscribers with arg data
     */
    notify = (data: T) => {
        for (const [handler, isOnce] of this.handlers) {
            handler(data);
            if (isOnce) {
                this.handlers.delete(handler);
            }
        }
    };
}
