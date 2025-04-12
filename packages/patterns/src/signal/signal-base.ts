export type Listener<T> = (data: T) => void;
type IS_ONCE = boolean;

export abstract class SignalBase<T, L extends Listener<T> = Listener<T>> {
    protected handlers = new Map<L, IS_ONCE>();
    constructor(handlers?: L[]) {
        handlers?.forEach((handler) => this.subscribe(handler));
    }

    abstract notify(data: T): ReturnType<L>;

    /**
     * Subscribe a notification callback
     *
     * @param handler - Will be executed with a data arg when a notification occurs
     */
    subscribe = (handler: L) => {
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
    once = (handler: L) => {
        if (this.handlers.get(handler) !== false) {
            this.handlers.set(handler, true);
        } else {
            throw new Error(`handler already exists as persistent listener`);
        }
    };

    /**
     * @returns true if a listener is subscribed
     */
    has(value: L): boolean {
        return this.handlers.has(value);
    }

    /**
     * Unsubscribe an existing callback
     */
    unsubscribe = (handler: L) => {
        this.handlers.delete(handler);
    };

    get size(): number {
        return this.handlers.size;
    }

    clear(): void {
        this.handlers.clear();
    }
}
