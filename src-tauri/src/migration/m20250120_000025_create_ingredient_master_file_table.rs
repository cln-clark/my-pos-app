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
                    .col(ColumnDef::new(IngredientMasterFile::LastCost).double().not_null().default(0))
                    .col(ColumnDef::new(IngredientMasterFile::PreferredUnitType).string().not_null())
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
    LastCost,
    PreferredUnitType,
}

#[derive(DeriveIden)]
enum UnitMaster {
    Table,
    Id,
}
