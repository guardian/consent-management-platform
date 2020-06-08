const gDomain = /theguardian\.com/;

export const mark = (label: string) => {
    window.performance?.mark?.(label);
    if (!window.location.host.match(gDomain)) {
        // eslint-disable-next-line no-console
        console.log(label);
    }
};
