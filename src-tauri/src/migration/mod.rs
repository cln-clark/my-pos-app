pub mod m20250120_000001_create_roles_table;
pub mod m20250120_000002_create_categories_table;
pub mod m20250120_000003_create_products_table;
pub mod m20250120_000004_create_txn_mode_table;
pub mod m20250120_000005_create_payment_type_table;
pub mod m20250120_000008_create_company_code_table;
pub mod m20250120_000009_create_store_code_table;
pub mod m20250120_000010_create_users_table;
pub mod m20250120_000011_create_discount_code_table;
pub mod m20250120_000015_create_crr_txn_header_table;
pub mod m20250120_000016_create_crr_txn_dtl_table;
pub mod m20250120_000017_create_crr_zx_reading_table;
pub mod m20250120_000018_create_temp_txn_header_table;
pub mod m20250120_000019_create_temp_txn_dtl_table;
pub mod m20250120_000020_create_temp_zx_reading_table;
pub mod m20250120_000021_create_hst_txn_header_table;
pub mod m20250120_000022_create_hst_txn_dtl_table;
pub mod m20250120_000023_create_hst_zx_reading_table;
pub mod m20250120_000024_create_unit_master_table;
pub mod m20250120_000025_create_ingredient_master_file_table;
pub mod m20250120_000026_create_conversion_file_table;
pub mod m20250120_000027_create_products_recipe_table;
pub mod m20250120_000028_create_product_variations_table;
pub mod m20250120_000029_add_variation_id_to_products_recipe;
pub mod m20250120_000030_create_recipe_templates_table;
pub mod m20250120_000031_create_recipe_items_table;
pub mod m20250120_000032_create_recipe_product_links_table;
pub mod m20250120_000033_remove_recipe_cost_from_products;
pub mod m20250120_000034_create_bundles_table;
pub mod m20250120_000035_create_add_ons_table;
pub mod m20250120_000036_create_bundle_items_table;
pub mod m20250120_000037_create_add_on_items_table;

pub use sea_orm_migration::prelude::*;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250120_000001_create_roles_table::Migration),
            Box::new(m20250120_000002_create_categories_table::Migration),
            Box::new(m20250120_000003_create_products_table::Migration),
            Box::new(m20250120_000004_create_txn_mode_table::Migration),
            Box::new(m20250120_000005_create_payment_type_table::Migration),
            Box::new(m20250120_000008_create_company_code_table::Migration),
            Box::new(m20250120_000009_create_store_code_table::Migration),
            Box::new(m20250120_000010_create_users_table::Migration),
            Box::new(m20250120_000011_create_discount_code_table::Migration),
            Box::new(m20250120_000015_create_crr_txn_header_table::Migration),
            Box::new(m20250120_000016_create_crr_txn_dtl_table::Migration),
            Box::new(m20250120_000017_create_crr_zx_reading_table::Migration),
            Box::new(m20250120_000018_create_temp_txn_header_table::Migration),
            Box::new(m20250120_000019_create_temp_txn_dtl_table::Migration),
            Box::new(m20250120_000020_create_temp_zx_reading_table::Migration),
            Box::new(m20250120_000021_create_hst_txn_header_table::Migration),
            Box::new(m20250120_000022_create_hst_txn_dtl_table::Migration),
            Box::new(m20250120_000023_create_hst_zx_reading_table::Migration),
            Box::new(m20250120_000024_create_unit_master_table::Migration),
            Box::new(m20250120_000025_create_ingredient_master_file_table::Migration),
            Box::new(m20250120_000026_create_conversion_file_table::Migration),
            Box::new(m20250120_000027_create_products_recipe_table::Migration),
            Box::new(m20250120_000028_create_product_variations_table::Migration),
            Box::new(m20250120_000029_add_variation_id_to_products_recipe::Migration),
            Box::new(m20250120_000034_create_bundles_table::Migration),
            Box::new(m20250120_000035_create_add_ons_table::Migration),
            Box::new(m20250120_000036_create_bundle_items_table::Migration),
            Box::new(m20250120_000037_create_add_on_items_table::Migration),
            Box::new(m20250120_000030_create_recipe_templates_table::Migration),
            Box::new(m20250120_000031_create_recipe_items_table::Migration),
            Box::new(m20250120_000032_create_recipe_product_links_table::Migration),
            Box::new(m20250120_000033_remove_recipe_cost_from_products::Migration),
        ]
    }
}
