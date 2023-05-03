import { performanceMeasures } from './performance-measures';

export interface IPerformance {
    mark(markName: string): void;
    measure(measureName: string, startMark?: string, endMark?: string): void;
    getEntriesByType(type: string): PerformanceEntry[];
}

function createGenericPerformanceReporter() {
    const initialStartTime = Date.now();
    const initMarkName = `__init__${Math.random().toString(16).slice(2)}`;
    const initMark: PerformanceMeasure = {
        duration: 0,
        entryType: 'mark',
        name: initMarkName,
        startTime: initialStartTime,
        detail: undefined,
        toJSON: () => JSON.stringify({ name: initMarkName, initialStartTime }),
    };
    const labels = new Map<string, PerformanceMeasure[]>();

    interface MarkTimeOptions {
        markName?: string;
        defaultMark: PerformanceMeasure;
    }

    function getMarkTime({ defaultMark, markName }: MarkTimeOptions) {
        // getting latest mark for the given markName (if given one)
        const { startTime } = markName ? labels.get(markName)?.slice(-1)[0] ?? defaultMark : defaultMark;
        return startTime;
    }

    function toJSON(this: PerformanceMeasure) {
        return JSON.stringify({
            name: this.name,
            startTime: this.startTime,
            duration: this.duration,
        });
    }

    return {
        mark: (markName: string) => {
            const mark = labels.get(markName);
            const startTime = Date.now();
            const currentMeasure: PerformanceMeasure = {
                duration: 0,
                entryType: 'mark',
                name: markName,
                startTime,
                detail: undefined,
                toJSON,
            };
            if (!mark) {
                labels.set(markName, [currentMeasure]);
            } else {
                mark.push(currentMeasure);
            }
        },
        measure: (measureName: string, startMark?: string, endMark?: string) => {
            const currentTime = { startTime: Date.now() };
            const startTime = getMarkTime({
                markName: startMark,
                defaultMark: initMark,
            });

            const endTime = getMarkTime({
                markName: endMark,
                defaultMark: currentTime as PerformanceMeasure,
            });

            performanceMeasures.set(measureName, {
                duration: endTime - startTime,
                startTime,
                entryType: 'measure',
                name: measureName,
                detail: undefined,
                toJSON,
            });
        },
        getEntriesByType: (type: 'measure' | 'mark') => {
            switch (type) {
                case 'mark':
                    return [...labels.values()];
                case 'measure':
                    return [...performanceMeasures.values()];
                default:
                    return [];
            }
        },
    };
}

export const Performance: IPerformance = globalThis.performance ?? createGenericPerformanceReporter();
