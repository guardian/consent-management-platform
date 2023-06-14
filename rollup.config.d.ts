declare const _default: ({
    input: string;
    external: (id: any) => boolean;
    output: {
        file: string;
        format: string;
    }[];
    plugins: any[];
    watch: {
        clearScreen: boolean;
    };
} | {
    input: string;
    output: {
        format: string;
        dir: string;
        sourcemap: string | boolean;
    };
    plugins: any[];
    watch: {
        clearScreen: boolean;
    };
})[];
export default _default;
