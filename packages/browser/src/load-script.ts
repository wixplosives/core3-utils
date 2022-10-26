/**
 * Loads a script in browser
 * @returns
 */
export const loadScript = (src: string, document: Document): Promise<void> =>
    new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    });
