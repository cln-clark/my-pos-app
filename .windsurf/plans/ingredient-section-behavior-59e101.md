# Ingredient Section Behavior

This plan fixes the product ingredients section behavior.

## Current Behavior
- Ingredient section shows when sync with inventory is checked
- Separate input row for adding new ingredients was deleted by user
- Layout is messy with different grid configurations

## Desired Behavior
- Ingredient section should be collapsible when sync with inventory is checked
- Only populate ingredients when editing a product (not when adding new product)
- Add button should add new ingredient rows
- Every ingredient row should have a delete button
- All rows should have consistent layout

## Implementation
1. Add collapsible state for ingredient section
2. Only load ingredients when editingProduct is set
3. Remove separate input row - use inline "Add" button at bottom
4. Ensure all ingredient rows have consistent grid layout
5. Add "Add Ingredient" button at bottom of list

## Status
Plan confirmed by user, ready to implement.
