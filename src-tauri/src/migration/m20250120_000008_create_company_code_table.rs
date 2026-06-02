use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create() 
                    .table(CompanyCode::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(CompanyCode::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(CompanyCode::CompanyCode)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .to_owned(),
            )
            .await?;

        let db = manager.get_connection();
        db.execute_unprepared(
            "INSERT OR IGNORE INTO company_code (company_code) VALUES (1)"
        ).await?;
        
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(CompanyCode::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum CompanyCode {
    Table,
    Id,
    CompanyCode
    }
