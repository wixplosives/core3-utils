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
export class Signal<T> {
    private onceHandlers = new Set<Listener<T>>();
    private handlers = new Set<Listener<T>>();
    constructor(handlers?: Listener<T>[], once?: Listener<T>[]) {
        handlers?.forEach((handler) => this.subscribe(handler));
        once?.forEach((handler) => this.once(handler));
    }

    /**
     * Subscribe a notification callback
     * @param handler - Will be executed with a data arg when a notification occurs
     */
    subscribe = (handler: Listener<T>) => {
        this.unsubscribe(handler);
        this.handlers.add(handler);
        // TODO: uncomment when engine COM is ready
        // return () => this.unsubscribe(handler);
    };
    once = (handler: Listener<T>) => {
        this.unsubscribe(handler);
        this.onceHandlers.add(handler);
        // TODO: uncomment when engine COM is ready
        // return () => this.unsubscribe(handler);
    };

    /**
     * @returns true if a listener is subscribed
     */
    has(value: Listener<T>): boolean {
        return this.handlers.has(value) || this.onceHandlers.has(value);
    }

    /**
     * Unsubscribe an existing callback
     */
    unsubscribe = (handler: Listener<T>) => {
        this.handlers.delete(handler);
        this.onceHandlers.delete(handler);
    };

    get size(): number {
        return this.handlers.size + this.onceHandlers.size;
    }

    /**
     * Notify all subscribers with arg data
     */
    notify = (data: T) => {
        for (const handler of this.handlers) {
            handler(data);
        }
        for (const handler of this.onceHandlers) {
            handler(data);
            this.onceHandlers.delete(handler);
        }
    };

    clear(): void {
        this.handlers.clear();
        this.onceHandlers.clear();
    }
}
