# Fix Ingredient Section Display

This plan removes the collapse/expand button and adds Total Cost field back to ingredient rows.

## Changes Required
1. Remove collapse/expand button from ingredient section header
2. Remove isIngredientsExpanded state (ingredient section auto-appears when sync checkbox is checked)
3. Add Total Cost field back to each ingredient row (qty * cost/unit)
4. Update grid layout from [2fr_1fr_1fr_1fr_auto] to [2fr_1fr_1fr_1fr_auto_auto] to include Total Cost column

## Implementation
- Remove Expand/Collapse button JSX
- Remove isIngredientsExpanded state variable
- Remove conditional rendering based on isIngredientsExpanded
- Add Total Cost div to each ingredient row
- Update grid columns to accommodate Total Cost

## Status
Plan created, awaiting user confirmation to implement.
