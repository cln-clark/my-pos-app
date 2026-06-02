use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create() 
                    .table(StoreCode::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(StoreCode::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(StoreCode::StoreCode)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(StoreCode::CompanyCode)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-store_code-company_code")
                            .from(StoreCode::Table, StoreCode::CompanyCode)
                            .to(CompanyCode::Table, CompanyCode::CompanyCode)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO store_code (store_code, company_code) VALUES (1, 1), (2, 1)"
        ).await?;
        
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(StoreCode::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum StoreCode {
    Table,
    Id,
    StoreCode,
    CompanyCode,
}

#[derive(DeriveIden)]
enum CompanyCode {
    Table,
    CompanyCode,
}