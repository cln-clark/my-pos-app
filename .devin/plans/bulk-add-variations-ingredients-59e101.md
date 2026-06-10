# Bulk Add Variations and Ingredients

This plan modifies the product modal to allow bulk entry of variations and ingredients without immediate database saves.

## Current Behavior
- Variations: Clicking "Add" immediately saves to database via `createVariation`
- Ingredients: Clicking "Add" only adds to local state (correct behavior)

## Changes Required

### 1. Product Variations
- Remove immediate database save in `handleAddVariation`
- Add variation to local state only (like ingredients)
- Save all variations when product is saved (in `handleSaveProduct`)
- Remove `handleUpdateVariation` and `handleDeleteVariation` (edit directly in grid)
- Allow inline editing of existing variations in the grid

### 2. Product Ingredients
- Already working correctly (adds to local state only)
- No changes needed

### 3. Save Logic
- When saving product, also save all variations from local state
- When saving product, also save all ingredients from local state (if sync with inventory is enabled)
