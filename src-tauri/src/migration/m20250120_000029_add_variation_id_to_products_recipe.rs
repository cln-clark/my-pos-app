use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Note: SQLite doesn't support adding foreign key constraints to existing tables
        // The foreign key relationship is handled at the application level via SeaORM
        
        // Try to add the column - if it already exists, this will fail but we'll ignore it
        let result = manager
            .alter_table(
                Table::alter()
                    .table(ProductsRecipe::Table)
                    .add_column(ColumnDef::new(ProductsRecipe::VariationId).integer())
                    .to_owned(),
            )
            .await;

        // Ignore error if column already exists
        if let Err(e) = result {
            if !e.to_string().contains("duplicate column name") {
                return Err(e);
            }
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ProductsRecipe::Table)
                    .drop_column(ProductsRecipe::VariationId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum ProductsRecipe {
    Table,
    VariationId,
}

#[derive(DeriveIden)]
enum ProductVariations {
    Table,
    Id,
}
