# Fix Ingredient Fields in Product Recipe

This plan clarifies and fixes the ingredient field behavior in the product modal.

## Current Behavior
- All fields (ingredient, UOM, cost/unit, quantity) are editable
- Cost/unit is manually entered

## Desired Behavior
- Ingredient: editable (select dropdown)
- UOM: select dropdown (auto-populated from ingredient's default UOM, editable)
- Cost/unit: auto-populated from ingredient's cost_price in inventory (read-only)
- Quantity: editable (input field)
- Total: computed (cost/unit * quantity)

## Implementation
1. When ingredient is selected, auto-populate UOM from ingredient's usage_unit_id
2. When ingredient is selected, auto-populate cost/unit from ingredient's cost_price
3. Make cost/unit read-only (display only)
4. Keep UOM editable in case user wants to change it
