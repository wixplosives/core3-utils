export type Listener<T> = (data: T) => void;
type IS_ONCE = boolean;

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
export class Signal<T> {
    private handlers = new Map<Listener<T>, IS_ONCE>();
    constructor(handlers?: Listener<T>[]) {
        handlers?.forEach((handler) => this.subscribe(handler));
    }

    /**
     * Subscribe a notification callback
     *
     * @param handler - Will be executed with a data arg when a notification occurs
     */
    subscribe = (handler: Listener<T>) => {
        if (this.handlers.get(handler) !== true) {
            this.handlers.set(handler, false);
        } else {
            throw new Error(`handler already exists as "once" listener`);
        }
    };

    /**
     * Subscribe to only the next notification
     *
     * @param handler - Will be executed with a data arg when a notification occurs
     */
    once = (handler: Listener<T>) => {
        if (this.handlers.get(handler) !== false) {
            this.handlers.set(handler, true);
        } else {
            throw new Error(`handler already exists as persistent listener`);
        }
    };

    /**
     * @returns true if a listener is subscribed
     */
    has(value: Listener<T>): boolean {
        return this.handlers.has(value);
    }

    /**
     * Unsubscribe an existing callback
     */
    unsubscribe = (handler: Listener<T>) => {
        this.handlers.delete(handler);
    };

    get size(): number {
        return this.handlers.size;
    }

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

    clear(): void {
        this.handlers.clear();
    }
}
