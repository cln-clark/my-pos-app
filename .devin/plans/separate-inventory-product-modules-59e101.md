# Separate Inventory and Product Modules

This plan separates the inventory and product modules into distinct sections, with inventory focusing on stock/ingredients tracking and products managing products, categories, bundles, and add-ons with optional inventory sync.

## Backend Changes

### Database Migrations
- Create `bundles` table (id, name, description, price, is_active, created_at, updated_at)
- Create `add_ons` table (id, name, description, price, is_active, created_at, updated_at)
- Create `bundle_items` table (id, bundle_id, product_id, quantity)
- Create `add_on_items` table (id, add_on_id, product_id, quantity)

### Rust Entities
- Create `src-tauri/src/entity/bundle.rs`
- Create `src-tauri/src/entity/add_on.rs`
- Create `src-tauri/src/entity/bundle_item.rs`
- Create `src-tauri/src/entity/add_on_item.rs`
- Update `src-tauri/src/entity/mod.rs` to include new entities

### Rust Commands
- Bundle CRUD: create_bundle, update_bundle, delete_bundle, get_bundles, get_bundle_with_items
- Add-on CRUD: create_add_on, update_add_on, delete_add_on, get_add_ons, get_add_on_with_items
- Bundle items: add_bundle_item, remove_bundle_item, update_bundle_item
- Add-on items: add_add_on_item, remove_add_on_item, update_add_on_item

### Frontend Types (lib/types.ts)
- Bundle interfaces: Bundle, BundleItem, CreateBundleRequest, UpdateBundleRequest
- Add-on interfaces: AddOn, AddOnItem, CreateAddOnRequest, UpdateAddOnRequest

### Frontend Data Functions (lib/data.ts)
- Bundle functions: getBundles, createBundle, updateBundle, deleteBundle, getBundleItems, addBundleItem, removeBundleItem
- Add-on functions: getAddOns, createAddOn, updateAddOn, deleteAddOn, getAddOnItems, addAddOnItem, removeAddOnItem

## Frontend Changes

### Move Components
- Move `ProductsTab.tsx` from `app/manager/inventory/` to `app/manager/products/`
- Move `CategoriesTab.tsx` from `app/manager/inventory/` to `app/manager/products/`

### Create New Components
- Create `BundleTab.tsx` in `app/manager/products/` (similar structure to ProductsTab)
- Create `AddonsTab.tsx` in `app/manager/products/` (similar structure to ProductsTab)

### Products Page
- Create `app/manager/products/page.tsx` with 4 tabs:
  - Products (moved ProductsTab)
  - Categories (moved CategoriesTab)
  - Bundle (new BundleTab)
  - Add-ons (new AddonsTab)

### ProductsTab Enhancements
- Add "Sync with Inventory" checkbox in the product modal
- Add collapsible section (using shadcn Collapsible) below checkbox
- Collapsible section contains:
  - Ingredient selector (combobox showing available ingredients)
  - UOM field
  - Cost per unit field
  - Total cost field (auto-calculated)
  - Add/remove ingredient buttons
- When sync is unchecked, hide the collapsible section
- When sync is checked, show the collapsible section for ingredient management

### Inventory Page Update
- Update `app/manager/inventory/page.tsx` to only show Ingredients tab
- Remove Products and Categories tabs from inventory page

## Context Updates
- Update `lib/context.tsx` to add bundle and add-on state if needed
- Update `lib/context.tsx` to remove product/category state from inventory context if needed
