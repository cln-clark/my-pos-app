use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(UnitMaster::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(UnitMaster::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(UnitMaster::CompanyId).integer().not_null().default(1))
                    .col(ColumnDef::new(UnitMaster::UnitCode).string().not_null().unique_key())
                    .col(ColumnDef::new(UnitMaster::UnitDescription).string().not_null())
                    .col(ColumnDef::new(UnitMaster::UnitType).string().not_null().default("weight"))
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared("
            INSERT OR IGNORE INTO unit_master (unit_code, unit_description, unit_type) VALUES
            ('KG', 'Kilogram', 'weight'),
            ('G', 'Gram', 'weight'),
            ('L', 'Liter', 'volume'),
            ('ML', 'Milliliter', 'volume'),
            ('PC', 'Piece', 'count'),
            ('BOX', 'Box', 'count'),
            ('CTN', 'Carton', 'count'),
            ('OZ', 'Ounce', 'weight'),
            ('LB', 'Pound', 'weight');
        ").await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(UnitMaster::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum UnitMaster {
    Table,
    Id,
    CompanyId,
    UnitCode,
    UnitDescription,
    UnitType,
}
