use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ProductsRecipe::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(ProductsRecipe::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(ProductsRecipe::ProductId).integer().not_null())
                    .col(ColumnDef::new(ProductsRecipe::IngredientId).integer().not_null())
                    .col(ColumnDef::new(ProductsRecipe::UsageQty).double().not_null())
                    .col(ColumnDef::new(ProductsRecipe::UsageUomCode).string().not_null())
                    .col(ColumnDef::new(ProductsRecipe::ActualUsage).double().not_null())
                    .col(ColumnDef::new(ProductsRecipe::Cost).double().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-products_recipe-product_id")
                            .from(ProductsRecipe::Table, ProductsRecipe::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-products_recipe-ingredient_id")
                            .from(ProductsRecipe::Table, ProductsRecipe::IngredientId)
                            .to(IngredientMasterFile::Table, IngredientMasterFile::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ProductsRecipe::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ProductsRecipe {
    Table,
    Id,
    ProductId,
    IngredientId,
    UsageQty,
    UsageUomCode,
    ActualUsage,
    Cost,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum IngredientMasterFile {
    Table,
    Id,
}
