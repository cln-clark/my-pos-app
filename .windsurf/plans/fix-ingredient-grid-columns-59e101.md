# Fix Ingredient Grid Columns

This plan fixes the grid column mismatch in the new ingredient input row.

## Issue
The new ingredient input row has 6 items (ingredient, UOM, cost/unit, quantity, total, add button) but the grid-cols is set to only 5 columns `[2fr_1fr_1fr_1fr_auto]`, causing the total field to be pushed out and replaced by the delete button from existing rows.

## Fix
Change the new ingredient input row grid-cols from `[2fr_1fr_1fr_1fr_auto]` to `[2fr_1fr_1fr_1fr_auto_auto]` to accommodate all 6 items.

## Status
Plan created, awaiting user confirmation to implement.
