# Add Ingredient Button and Save Behavior

This plan modifies the ingredient addition flow to match variations behavior.

## Current Implementation
- "Add" button at bottom of ingredient section adds ingredient to local state (with validation)
- Save button saves product, variations, and has TODO for ingredients

## Changes Required
1. Remove validation from "Add" button to allow adding blank lines (like variations)
2. Keep Save button behavior as is (already saves product and variations, ingredients has TODO for backend)

## Implementation
- Remove validation check in handleAddIngredient
- Allow adding ingredient lines even if fields are empty

## Status
Plan created, awaiting user confirmation to implement.
