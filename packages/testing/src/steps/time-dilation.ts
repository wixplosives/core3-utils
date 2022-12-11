
let _timeDilation=1;

/**
 * Get current test step time dilation
 *
 * - All timeout set in tests will be multiplied by timeDilation()
 */
export function timeDilation(): number;
/**
 * Set current test step time dilation
 *
 * - All timeout set in tests will be multiplied by timeDilation()
 */
export function timeDilation(value: number): number;
/**
 * @internal
 */
export function timeDilation(value?: number) {
    if (value && value > 0) {
        _timeDilation = value;
    }
    return _timeDilation;
}
