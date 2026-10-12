// jsdom polyfills for layout APIs used by QuranPage
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    private cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
    }
    observe(target: Element) {
      const rect = target.getBoundingClientRect?.() ?? { width: 400, height: 0 };
      const width = rect.width || 400;
      this.cb(
        [
          {
            target,
            contentRect: {
              width,
              height: width * 1.55,
              x: 0,
              y: 0,
              top: 0,
              left: 0,
              bottom: width * 1.55,
              right: width,
              toJSON() {
                return {};
              },
            },
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          } as ResizeObserverEntry,
        ],
        this,
      );
    }
    unobserve() {}
    disconnect() {}
  };
}
