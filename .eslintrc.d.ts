export let root: boolean;
export namespace env {
    let jest: boolean;
    let browser: boolean;
}
export namespace globals {
    let __PACKAGE_VERSION__: string;
}
export let ignorePatterns: string[];
export let parser: string;
export namespace parserOptions {
    let ecmaVersion: number;
    let project: string;
    let sourceType: string;
}
export let rules: {
    'no-underscore-dangle': number;
};
export let overrides: ({
    files: string[];
    extends: string[];
    rules?: undefined;
} | {
    files: string[];
    rules: {
        '@typescript-eslint/no-unsafe-return': number;
        '@typescript-eslint/no-unsafe-call': number;
        '@typescript-eslint/no-floating-promises': number;
        '@typescript-eslint/no-unsafe-member-access': number;
        '@typescript-eslint/no-unsafe-assignment': number;
        '@typescript-eslint/no-var-requires': number;
        '@typescript-eslint/unbound-method': number;
        '@typescript-eslint/no-unsafe-argument': number;
    };
    extends?: undefined;
})[];
