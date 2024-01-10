export interface IDisposable {
    /**
     * disposes the instance removing all event listeners
     */
    dispose(): void;

    /**
     * is the instance disposed
     */
    isDisposed(): boolean;
}
