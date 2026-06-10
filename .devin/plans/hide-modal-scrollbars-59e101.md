# Hide Scrollbars in Back Office Modals

This plan adds a CSS utility class to hide scrollbars in all back office modal dialogs while still allowing scroll functionality.

## Changes

### 1. Add Global CSS Utility
- Add `.scrollbar-hide` class to `app/globals.css` with webkit scrollbar hiding styles

### 2. Update DialogContent Components
Apply the `scrollbar-hide` class to all DialogContent components in back office:
- `app/manager/page.tsx` - Pin confirmation dialog
- `app/manager/products/ProductsTab.tsx` - Product dialog
- `app/manager/products/CategoriesTab.tsx` - Category dialog
- `app/manager/products/BundleTab.tsx` - Bundle and bundle items dialogs
- `app/manager/products/AddonsTab.tsx` - Add-on and add-on items dialogs
- `app/manager/inventory/IngredientsTab.tsx` - Ingredient and restock dialogs

## Implementation
- Add CSS rule to hide scrollbars for webkit browsers
- Apply class to DialogContent elements that have `overflow-y-auto` or set max-height
