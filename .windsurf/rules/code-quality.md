---
trigger: always_on
---

**Code Quality and Architecture**
Always prioritize clean, maintainable code over quick solutions. Never write spaghetti code — every function, component, and module must have a single clear responsibility.
Follow Object-Oriented Programming principles as much as possible. Separate concerns strictly — data fetching, business logic, and UI rendering must never be mixed in the same function or component.
For React components, never put database calls, business logic, or data transformation directly inside JSX or event handlers. Extract them into separate functions, hooks, or service files.
For data fetching, all invoke() calls must live in lib/data.ts only. Components never call invoke() directly — they call functions from data.ts instead.
For business logic, complex calculations (totals, tax, discounts, change computation) must be extracted into separate utility functions in lib/utils.ts. Never inline business logic inside components.
For Rust commands, each command must do one thing only. If a command is doing more than fetching or inserting one resource, split it into smaller focused commands.
For TypeScript, always type everything explicitly. Never use any unless absolutely unavoidable and must be justified with a comment explaining why. Always define interfaces for all data structures in lib/types.ts.
For components, if a component exceeds 150 lines, it must be broken down into smaller sub-components. Each sub-component lives in its own file under the appropriate feature folder.
For state management, never duplicate state. If the same data is needed in multiple components, it lives in context only — never in multiple useState calls across components.
For error handling, every async function must have try/catch. Errors must never be silently swallowed — always log or surface them to the user via toast or error state.
For naming conventions, functions must be named after what they do (getProducts, createTransaction, calculateTotal). Components must be named after what they represent (ProductGrid, CartPanel, PaymentScreen). Never use generic names like handleData, processStuff, or doThing.
For file organization, strictly follow the established folder structure. Never create files in the wrong location just because it is convenient. New features always get their own folder under components/ grouped by feature.