pub mod m20250120_000001_create_roles_table;
pub mod m20250120_000002_create_categories_table;
pub mod m20250120_000003_create_products_table;
pub mod m20250120_000004_create_txn_mode_table;
pub mod m20250120_000005_create_payment_type_table;
pub mod m20250120_000006_create_transaction_head_table;
pub mod m20250120_000007_create_transaction_dtl_table;
pub mod m20250120_000008_create_company_code_table;
pub mod m20250120_000009_create_store_code_table;
pub mod m20250120_000010_create_users_table;
pub mod m20250120_000011_create_discount_code_table;
pub mod m20250120_000012_create_pos_zx_reading_table;
pub mod m20250120_000013_add_void_reason_to_pos_zx_reading;
pub mod m20250120_000014_add_original_transaction_no_to_txn_head;
pub mod m20250120_000015_create_crr_txn_header_table;
pub mod m20250120_000016_create_crr_txn_dtl_table;
pub mod m20250120_000017_create_crr_zx_reading_table;
pub mod m20250120_000018_create_temp_txn_header_table;
pub mod m20250120_000019_create_temp_txn_dtl_table;
pub mod m20250120_000020_create_temp_zx_reading_table;
pub mod m20250120_000021_create_hst_txn_header_table;
pub mod m20250120_000022_create_hst_txn_dtl_table;
pub mod m20250120_000023_create_hst_zx_reading_table;

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
            Box::new(m20250120_000006_create_transaction_head_table::Migration),
            Box::new(m20250120_000007_create_transaction_dtl_table::Migration),
            Box::new(m20250120_000008_create_company_code_table::Migration),
            Box::new(m20250120_000009_create_store_code_table::Migration),
            Box::new(m20250120_000010_create_users_table::Migration),
            Box::new(m20250120_000011_create_discount_code_table::Migration),
            Box::new(m20250120_000012_create_pos_zx_reading_table::Migration),
            Box::new(m20250120_000013_add_void_reason_to_pos_zx_reading::Migration),
            Box::new(m20250120_000014_add_original_transaction_no_to_txn_head::Migration),
            Box::new(m20250120_000015_create_crr_txn_header_table::Migration),
            Box::new(m20250120_000016_create_crr_txn_dtl_table::Migration),
            Box::new(m20250120_000017_create_crr_zx_reading_table::Migration),
            Box::new(m20250120_000018_create_temp_txn_header_table::Migration),
            Box::new(m20250120_000019_create_temp_txn_dtl_table::Migration),
            Box::new(m20250120_000020_create_temp_zx_reading_table::Migration),
            Box::new(m20250120_000021_create_hst_txn_header_table::Migration),
            Box::new(m20250120_000022_create_hst_txn_dtl_table::Migration),
            Box::new(m20250120_000023_create_hst_zx_reading_table::Migration),
        ]
    }
}
