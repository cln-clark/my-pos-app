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
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared("
            INSERT OR IGNORE INTO unit_master (unit_code, unit_description) VALUES
            ('KG', 'Kilogram'),
            ('G', 'Gram'),
            ('L', 'Liter'),
            ('ML', 'Milliliter'),
            ('PCS', 'Piece'),
            ('BOX', 'Box'),
            ('CTN', 'Carton'),
            ('OZ', 'Ounce'),
            ('LB', 'Pound');
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
}
