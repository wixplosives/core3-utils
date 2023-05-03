export abstract class AnimationFrameScheduler<PARAMS extends any[] = [Element]> {
    private requestAnimationFrameId = 0;

    protected abstract onAnimationFrame(...params: PARAMS): void;
    protected abstract onDispose(): void;

    public start(...args: PARAMS) {
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
        }

        this.triggerRequestAnimationFrame(...args);
    }

    public dispose() {
        if (this.requestAnimationFrameId) {
            cancelAnimationFrame(this.requestAnimationFrameId);
        }
        this.onDispose();
    }

    private triggerRequestAnimationFrame(...args: PARAMS) {
        this.requestAnimationFrameId = requestAnimationFrame(() => {
            this._onAnimationFrame(...args);
        });
    }

    private _onAnimationFrame(...args: PARAMS) {
        this.onAnimationFrame(...args);
        this.triggerRequestAnimationFrame(...args);
    }
}
