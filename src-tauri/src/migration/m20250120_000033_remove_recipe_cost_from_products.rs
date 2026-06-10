use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Try to drop the column - if it doesn't exist, ignore the error
        let result = manager
            .alter_table(
                Table::alter()
                    .table(Products::Table)
                    .drop_column(Products::RecipeCost)
                    .to_owned(),
            )
            .await;

        // Ignore error if column doesn't exist
        if let Err(e) = result {
            if !e.to_string().contains("no such column") && !e.to_string().contains("duplicate column name") {
                return Err(e);
            }
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Products::Table)
                    .add_column(ColumnDef::new(Products::RecipeCost).double().not_null().default(0))
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Products {
    Table,
    RecipeCost,
}
