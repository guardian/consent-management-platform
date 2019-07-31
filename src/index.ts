export const Greeter = (name: string) => {
    return `Hello ${name}`;
};

export const GreeterPlus = (name: string) => {
    return `${Greeter(name)}!`;
};
