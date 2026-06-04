use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(IngredientMasterFile::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(IngredientMasterFile::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(IngredientMasterFile::CompanyId).integer().not_null().default(1))
                    .col(ColumnDef::new(IngredientMasterFile::IngrCode).string().not_null().unique_key())
                    .col(ColumnDef::new(IngredientMasterFile::Description).string().not_null())
                    .col(ColumnDef::new(IngredientMasterFile::CostPrice).double().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::MinStockLvl).integer().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::MaxStockLvl).integer().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::UsageUnitId).integer())
                    .col(ColumnDef::new(IngredientMasterFile::BaseStockQty).integer().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::LocalCost).double().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::ConversionRate).double().not_null().default(1))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-ingredient_master_file-usage_unit_id")
                            .from(IngredientMasterFile::Table, IngredientMasterFile::UsageUnitId)
                            .to(UnitMaster::Table, UnitMaster::Id)
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared("
            INSERT OR IGNORE INTO ingredient_master_file (ingr_code, description, cost_price, min_stock_lvl, max_stock_lvl, base_stock_qty, local_cost, conversion_rate) VALUES
            ('ING-001', 'Sugar', 45.00, 10, 100, 50, 45.00, 1),
            ('ING-002', 'Flour', 38.00, 10, 100, 50, 38.00, 1),
            ('ING-003', 'Milk', 65.00, 5, 50, 25, 65.00, 1),
            ('ING-004', 'Coffee Powder', 120.00, 5, 50, 25, 120.00, 1),
            ('ING-005', 'Ice', 5.00, 20, 200, 100, 5.00, 1);
        ").await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(IngredientMasterFile::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum IngredientMasterFile {
    Table,
    Id,
    CompanyId,
    IngrCode,
    Description,
    CostPrice,
    MinStockLvl,
    MaxStockLvl,
    UsageUnitId,
    BaseStockQty,
    LocalCost,
    ConversionRate,
}

#[derive(DeriveIden)]
enum UnitMaster {
    Table,
    Id,
}
