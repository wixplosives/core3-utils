import { SignalBase } from './signal-base';

export type AsyncListener<T> = (data: T) => Promise<void> | void;

/**
 * AsyncSignal is similar to Signal but supports async handlers and awaits their completion.
 *
 * @example
 * ```ts
 * const dataProcessed = new AsyncSignal<ProcessedData>();
 *
 * dataProcessed.subscribe(async (data) => {
 *   await saveToDatabase(data);
 *   console.log('Data saved');
 * });
 *
 * await dataProcessed.notify(processedData);
 * console.log('All handlers completed');
 * ```
 */
export class AsyncSignal<T> extends SignalBase<T, AsyncListener<T>> {
    /**
     * Notify all subscribers with arg data and wait for all handlers to complete
     * @returns Promise that resolves when all handlers have completed
     */
    notify = async (data: T) => {
        const promises: Promise<void>[] = [];

        for (const [handler, isOnce] of this.handlers) {
            const result = handler(data);
            if (result) {
                promises.push(result);
            }
            if (isOnce) {
                this.handlers.delete(handler);
            }
        }

        await Promise.all(promises);
    };
}
