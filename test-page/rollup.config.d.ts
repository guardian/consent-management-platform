declare namespace _default {
    let input: string;
    namespace output {
        export let format: string;
        export { dist as dir };
        export let sourcemap: string | boolean;
    }
    let plugins: any[];
    namespace watch {
        let clearScreen: boolean;
    }
}
export default _default;
declare const dist: "test-page/dist";
