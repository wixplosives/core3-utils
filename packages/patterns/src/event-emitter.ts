import { Signal } from './signal';

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
export class EventEmitter<Events extends object, EventId extends keyof Events = keyof Events> {
    protected events = new Map<EventId, Signal<any>>();
    protected emitOnce = new Map<EventId, Signal<any>>();

    /**
     * Check if an event has subscribers
     * @returns true if event has subscribers
     */
    hasSubscribers = (event: EventId) => this.events.has(event);

    /**
     * Subscribe a handler for event
     * @returns unsubscribe fn
     */
    subscribe = <Event extends EventId>(event: Event, handler: (data: Events[Event]) => void) => {
        const bucket = this.events.get(event);
        bucket ? bucket.add(handler) : this.events.set(event, new Signal([handler]));
        return () => this.unsubscribe(event, handler);
    };

    /**
     * {@inheritDoc EventEmitter.subscribe}
     */
    on = this.subscribe;

    /**
     * Adds a handler that will be called at most once
     * @returns unsubscribe fn
     */
    once = <Event extends EventId>(event: Event, handler: (data: Events[Event]) => void) => {
        this.off(event, handler);
        const bucket = this.emitOnce.get(event);
        bucket ? bucket.add(handler) : this.emitOnce.set(event, new Signal([handler]));
        return () => this.unsubscribe(event, handler);
    };

    /**
     * Unsubscribe a handler from event
     */
    unsubscribe = <Event extends EventId>(event: Event, handler: (data: Events[Event]) => void) => {
        let bucket = this.events.get(event);
        bucket?.delete(handler);
        bucket?.size === 0 && this.events.delete(event);
        bucket = this.emitOnce.get(event);
        bucket?.delete(handler);
        bucket?.size === 0 && this.events.delete(event);
    };

    /**
     * {@inheritDoc EventEmitter.unsubscribe}
     */
    off = this.unsubscribe;

    /**
     * Drop all subscriptions of a signal
     * @param event - signal id
     */
    delete = <Event extends EventId>(event: Event) => {
        this.events.delete(event);
        this.emitOnce.delete(event);
    };

    /**
     * Drop all subscriptions
     */
    clear = () => {
        this.events = new Map<EventId, Signal<any>>();
        this.emitOnce = new Map<EventId, Signal<any>>();
    };

    /**
     * {@inheritDoc Signal.notify}
     * @param event - eve
     * @param data - event data
     */
    notify = <Event extends EventId>(event: Event, data: Events[Event]) => {
        this.events.get(event)?.notify(data);
        this.emitOnce.get(event)?.notify(data);
        this.emitOnce.delete(event);
    };

    /**
     * {@inheritDoc EventEmitter.notify}
     */
    emit = this.notify;
}

export type IEventEmitter<T extends Record<string, any>> = Pick<EventEmitter<T>, keyof EventEmitter<T>>;
