---
'@guardian/consent-management-platform': minor
---

-   Adding the includeGppApi param to the sourcepoint config for CCPA.
-   Updating type to include includeGppApi for the window object.
-   Refactoring stub.ts to load both \_\_uspapi and \_\_gpp stub for CCPA but only load \_\_uspapi for AUS.
