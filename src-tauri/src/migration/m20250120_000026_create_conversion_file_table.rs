use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ConversionFile::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(ConversionFile::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(ConversionFile::CompanyId).integer().not_null().default(1))
                    .col(ColumnDef::new(ConversionFile::UnitToConvert).string().not_null())
                    .col(ColumnDef::new(ConversionFile::ConvertTo).string().not_null())
                    .col(ColumnDef::new(ConversionFile::Rate).double().not_null())
                    .col(ColumnDef::new(ConversionFile::Spare).string())
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared("
            INSERT OR IGNORE INTO conversion_file (unit_to_convert, convert_to, rate) VALUES
            ('KG', 'G', 1000),
            ('G', 'KG', 0.001),
            ('L', 'ML', 1000),
            ('ML', 'L', 0.001),
            ('BOX', 'PCS', 12),
            ('PCS', 'BOX', 0.083333),
            ('CTN', 'PCS', 24),
            ('PCS', 'CTN', 0.041667);
        ").await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ConversionFile::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ConversionFile {
    Table,
    Id,
    CompanyId,
    UnitToConvert,
    ConvertTo,
    Rate,
    Spare,
}
