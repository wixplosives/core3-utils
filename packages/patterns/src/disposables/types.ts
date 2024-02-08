export interface IDisposable {
    /**
     * starts instance disposal
     * @return a promise that resolves when disposal is done
     */
    dispose(): Promise<void>;

    /**
     * is the instance disposed (or is disposing)
     */
    isDisposed(): boolean;
}

/**
 *
 * @param value
 * @returns true if value is IDisposable
 */
export function isDisposable(value: any): value is IDisposable {
    return (
        'dispose' in value &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value.dispose === 'function' &&
        'isDisposed' in value &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof value.isDisposed === 'function'
    );
}
