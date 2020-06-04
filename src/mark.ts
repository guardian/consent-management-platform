const localhost = /localhost/;

export const mark = (label: string) => {
    window.performance?.mark?.(label);
    if (window.location.host.match(localhost)) {
        // eslint-disable-next-line no-console
        console.log(label);
    }
};
