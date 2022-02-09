// I want to import this enum here and use it for a check in CI:

import { VendorIDs } from "../src/getConsentFor";

// @ts-ignore
console.log(VendorIDs)

// This results in:
// (node:15152) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
// So I am doing something badly wrong :)

// How should I read that enum here?
