use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(RecipeProductLinks::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(RecipeProductLinks::Id).integer().auto_increment().primary_key())
                    .col(ColumnDef::new(RecipeProductLinks::RecipeId).integer().not_null())
                    .col(ColumnDef::new(RecipeProductLinks::ProductId).integer())
                    .col(ColumnDef::new(RecipeProductLinks::VariationId).integer())
                    .col(ColumnDef::new(RecipeProductLinks::IsDefault).boolean().not_null().default(false))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-recipe_product_links-recipe_id")
                            .from(RecipeProductLinks::Table, RecipeProductLinks::RecipeId)
                            .to(RecipeTemplates::Table, RecipeTemplates::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-recipe_product_links-product_id")
                            .from(RecipeProductLinks::Table, RecipeProductLinks::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-recipe_product_links-variation_id")
                            .from(RecipeProductLinks::Table, RecipeProductLinks::VariationId)
                            .to(ProductVariations::Table, ProductVariations::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(RecipeProductLinks::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum RecipeProductLinks {
    Table,
    Id,
    RecipeId,
    ProductId,
    VariationId,
    IsDefault,
}

#[derive(DeriveIden)]
enum RecipeTemplates {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum ProductVariations {
    Table,
    Id,
}
