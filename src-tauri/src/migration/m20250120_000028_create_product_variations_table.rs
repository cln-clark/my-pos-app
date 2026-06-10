use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ProductVariations::Table)
                    .col(
                        ColumnDef::new(ProductVariations::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ProductVariations::ProductId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ProductVariations::Name)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ProductVariations::Price)
                            .double()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ProductVariations::IsActive)
                            .boolean()
                            .not_null()
                            .default(true),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-product_variations-product_id")
                            .from(ProductVariations::Table, ProductVariations::ProductId)
                            .to(Products::Table, Products::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ProductVariations::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ProductVariations {
    Table,
    Id,
    ProductId,
    Name,
    Price,
    IsActive,
}

#[derive(DeriveIden)]
enum Products {
    Table,
    Id,
}
